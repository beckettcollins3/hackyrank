import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export default function Upload() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onFile = (e) => {
    setErr("");
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setErr("Please choose a video file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setErr("File too large. Max 50MB for MVP.");
      return;
    }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;
    setBusy(true);
    setErr("");
    setProgress(10);

    try {
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("videos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (upErr) throw upErr;
      setProgress(70);

      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      const { error: insErr } = await supabase.from("videos").insert({
        user_id: user.id,
        video_url: publicUrl,
        caption: caption.trim() || null,
      });
      if (insErr) throw insErr;

      setProgress(100);
      await refreshProfile();
      navigate("/");
    } catch (e2) {
      setErr(e2.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-3">⬆️ Upload Clip</h1>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="block">
          <span className="text-sm text-gray-400">Video file (mp4/mov, ≤50MB)</span>
          <input
            type="file"
            accept="video/*"
            onChange={onFile}
            required
            className="mt-1 block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-red-500 file:text-white hover:file:bg-red-600"
          />
        </label>

        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={280}
          className="p-2 rounded bg-zinc-800 border border-gray-700 focus:outline-none focus:border-red-500"
        />

        {err && <p className="text-red-400 text-sm">{err}</p>}

        {busy && (
          <div className="w-full bg-gray-800 rounded h-2 overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!file || busy}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded"
        >
          {busy ? "Posting…" : "Post Clip"}
        </button>
      </form>
    </div>
  );
}
