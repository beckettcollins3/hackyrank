import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import TopBar from "../components/TopBar";
import { CloudUpload, Film, X, Hash, CheckCircle2 } from "lucide-react";

const MAX_BYTES = 80 * 1024 * 1024; // 80 MB

export default function Upload() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (f) => {
    setErr("");
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setErr("Please choose a video file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setErr("File too large. Max 80 MB.");
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const addTagFromInput = () => {
    const t = tagInput.replace(/^#/, "").trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) {
      setTagInput("");
      return;
    }
    if (tags.length >= 8) {
      setTagInput("");
      return;
    }
    setTags([...tags, t]);
    setTagInput("");
  };

  const onTagKey = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      addTagFromInput();
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;
    setBusy(true);
    setErr("");
    setProgress(8);

    try {
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const t1 = Date.now();
      // Fake-progress while upload is in flight (Supabase SDK lacks streamed progress in browsers).
      const progressTimer = setInterval(() => {
        setProgress((p) => {
          const elapsed = (Date.now() - t1) / 1000;
          const target = Math.min(80, 8 + elapsed * 12);
          return p < target ? target : p;
        });
      }, 250);

      const { error: upErr } = await supabase.storage
        .from("videos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      clearInterval(progressTimer);
      if (upErr) throw upErr;
      setProgress(88);

      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);
      const tagString = tags.map((t) => `#${t}`).join(" ");
      const finalCaption =
        caption.trim() && tagString
          ? `${caption.trim()} ${tagString}`
          : caption.trim() || tagString || null;

      const { error: insErr } = await supabase.from("videos").insert({
        user_id: user.id,
        video_url: pub.publicUrl,
        caption: finalCaption,
      });
      if (insErr) throw insErr;

      setProgress(100);
      setDone(true);
      await refreshProfile();
      setTimeout(() => navigate("/"), 1100);
    } catch (e2) {
      setErr(e2.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TopBar title="New clip" back />
      <div className="max-w-md mx-auto px-4 pt-3 relative">
        {done && (
          <div className="fixed inset-0 z-50 grid place-items-center pointer-events-none animate-fade-in">
            <div className="size-24 rounded-full bg-gradient-neon grid place-items-center shadow-glow-neon animate-scale-in">
              <CheckCircle2 className="size-12 text-graphite-900" strokeWidth={3} />
            </div>
          </div>
        )}

        {!file ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`block cursor-pointer rounded-3xl border-2 border-dashed transition ${
              dragging
                ? "border-electric-400 bg-electric/10"
                : "border-white/15 bg-graphite-800 hover:bg-graphite-700"
            } p-8 text-center`}
          >
            <div className="mx-auto size-16 rounded-2xl bg-gradient-electric grid place-items-center mb-4 shadow-glow">
              <CloudUpload className="size-8 text-graphite-900" strokeWidth={2.5} />
            </div>
            <h2 className="font-display font-bold text-lg">Drop a clip</h2>
            <p className="text-ink-400 text-sm mt-1">
              MP4 or MOV up to 80 MB. Drag here or tap to browse.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
            <span className="inline-flex mt-5 px-5 py-2.5 rounded-full bg-gradient-electric text-graphite-900 text-sm font-bold shadow-glow">
              Choose video
            </span>
          </label>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[9/16] max-h-[60vh] mx-auto">
              {previewUrl && (
                <video
                  src={previewUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="size-full object-contain bg-black"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setProgress(0);
                }}
                className="absolute top-2 right-2 size-9 grid place-items-center rounded-full glass-pill"
                aria-label="Remove"
              >
                <X className="size-4" />
              </button>
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full glass-pill text-[11px] flex items-center gap-1.5">
                <Film className="size-3.5" />
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            </div>

            <label className="block">
              <span className="text-xs text-ink-400 mb-1 block">Caption</span>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={280}
                rows={2}
                placeholder="Hyped about this stall? Tell the story…"
                className="w-full px-3 py-2.5 rounded-2xl bg-graphite-800 border border-white/5 focus:outline-none focus:border-electric-400/60 resize-none placeholder:text-ink-500"
              />
              <div className="text-[11px] text-ink-500 text-right mt-1 tabular-nums">
                {caption.length}/280
              </div>
            </label>

            <label className="block">
              <span className="text-xs text-ink-400 mb-1 block">Hashtags</span>
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-graphite-800 border border-white/5 focus-within:border-electric-400/60">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-electric/15 text-electric-400 text-xs font-medium"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="opacity-70 hover:opacity-100"
                      aria-label={`Remove ${t}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center flex-1 min-w-[120px]">
                  <Hash className="size-3.5 text-ink-500" />
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={onTagKey}
                    onBlur={addTagFromInput}
                    placeholder={tags.length === 0 ? "hackysack stalls trick…" : ""}
                    className="flex-1 bg-transparent px-1 py-1 text-sm focus:outline-none placeholder:text-ink-500"
                  />
                </div>
              </div>
            </label>

            {err && <p className="text-hot text-sm">{err}</p>}

            {busy && (
              <div className="space-y-1.5">
                <div className="h-1.5 rounded-full bg-graphite-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-electric transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-[11px] text-ink-400 text-right tabular-nums">
                  {progress < 100 ? `Uploading… ${Math.round(progress)}%` : "Finalizing…"}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || busy}
              className="w-full h-12 rounded-2xl bg-gradient-electric text-graphite-900 font-bold shadow-glow disabled:opacity-50 active:scale-[0.99] transition"
            >
              {busy ? "Posting…" : done ? "Posted!" : "Post clip"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
