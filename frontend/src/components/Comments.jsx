import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import Avatar from "./Avatar";
import { Send, X } from "lucide-react";

function timeAgo(iso) {
  const t = new Date(iso).getTime();
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function Comments({ videoId, onClose }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("comments")
      .select(
        "id, text, created_at, users:users!comments_user_id_fkey(username, avatar_url, rank_tier)"
      )
      .eq("video_id", videoId)
      .order("created_at", { ascending: false })
      .limit(100);
    setItems(data ?? []);
    setLoading(false);
  }, [videoId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    setPosting(true);
    setText("");
    // Optimistic
    const tmpId = `tmp-${Date.now()}`;
    setItems((prev) => [
      {
        id: tmpId,
        text: trimmed,
        created_at: new Date().toISOString(),
        users: { username: "you", avatar_url: null, rank_tier: null },
      },
      ...prev,
    ]);
    const { error } = await supabase
      .from("comments")
      .insert({ user_id: user.id, video_id: videoId, text: trimmed });
    setPosting(false);
    if (error) {
      // Rollback
      setItems((prev) => prev.filter((c) => c.id !== tmpId));
    } else {
      load();
    }
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/55" />
      <div
        className="relative w-full max-h-[78%] bg-graphite-800 rounded-t-3xl border-t border-white/10 shadow-card flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-2 pb-1 grid place-items-center">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="font-semibold">
            {items.length} {items.length === 1 ? "comment" : "comments"}
          </h3>
          <button
            onClick={onClose}
            className="size-8 grid place-items-center rounded-full hover:bg-white/5"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-none">
          {loading ? (
            <p className="text-ink-400 text-sm">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-ink-400 text-sm py-6 text-center">
              Be the first to comment.
            </p>
          ) : (
            items.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar
                  src={c.users?.avatar_url}
                  username={c.users?.username}
                  tier={c.users?.rank_tier}
                  size={32}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-ink-50">
                      @{c.users?.username ?? "user"}
                    </span>
                    <span className="text-[11px] text-ink-400">
                      {timeAgo(c.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-ink-50/95 break-words">
                    {c.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={submit}
          className="px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 border-t border-white/5 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={user ? "Add a comment…" : "Log in to comment"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!user || posting}
            className="flex-1 px-4 h-10 rounded-full bg-graphite-700 border border-white/5 placeholder:text-ink-400 focus:outline-none focus:border-electric-400/60 disabled:opacity-60"
          />
          <button
            disabled={!user || posting || !text.trim()}
            className="size-10 grid place-items-center rounded-full bg-gradient-electric text-graphite-900 disabled:opacity-40 active:scale-95"
            aria-label="Post comment"
          >
            <Send className="size-4" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
