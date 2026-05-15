import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function EditProfileModal({ profile, onClose, onSaved }) {
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

  const onAvatarFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr("Avatar must be an image.");
      return;
    }
    setErr("");
    setUploading(true);
    try {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("videos")
        .upload(path, f, { upsert: true, contentType: f.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);
      setAvatarUrl(pub.publicUrl);
    } catch (e2) {
      setErr(e2.message || "Avatar upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) {
      setErr("Username must be 3–20 chars (letters, digits, underscore).");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({
        username: username.toLowerCase(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSaved?.();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="relative w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl glass-strong p-5 pb-[max(env(safe-area-inset-bottom),20px)] animate-slide-up sm:animate-scale-in"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">Edit profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="size-8 grid place-items-center rounded-full hover:bg-white/5"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative size-20 rounded-2xl overflow-hidden bg-graphite-700 grid place-items-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-2xl font-bold">
                {(username || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 grid place-items-center">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
          </div>
          <label className="px-3 py-2 rounded-xl glass-pill text-sm cursor-pointer hover:bg-white/10">
            Change avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarFile}
            />
          </label>
        </div>

        <label className="block mb-3">
          <span className="text-xs text-ink-400 mb-1 block">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 h-11 rounded-xl bg-graphite-700 border border-white/5 focus:outline-none focus:border-electric-400/60"
          />
        </label>

        <label className="block mb-4">
          <span className="text-xs text-ink-400 mb-1 block">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell people about your hackysack journey…"
            className="w-full px-3 py-2 rounded-xl bg-graphite-700 border border-white/5 focus:outline-none focus:border-electric-400/60 resize-none"
          />
        </label>

        {err && <p className="text-hot text-sm mb-3">{err}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-graphite-700 hover:bg-graphite-600"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="flex-1 h-11 rounded-xl bg-gradient-electric text-graphite-900 font-semibold shadow-glow disabled:opacity-60 active:scale-95"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
