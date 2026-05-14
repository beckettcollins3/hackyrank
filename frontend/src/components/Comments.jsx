import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

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
      .select("id, text, created_at, users:users!comments_user_id_fkey(username)")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false })
      .limit(50);
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
    if (!text.trim()) return;
    setPosting(true);
    const { error } = await supabase
      .from("comments")
      .insert({ user_id: user.id, video_id: videoId, text: text.trim() });
    setPosting(false);
    if (!error) {
      setText("");
      load();
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 max-h-[60%] bg-zinc-950/95 border-t border-gray-800 rounded-t-2xl p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Comments</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 text-sm">
        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400">No comments yet.</p>
        ) : (
          items.map((c) => (
            <div key={c.id} className="border-b border-gray-800 pb-2">
              <p className="text-gray-300">
                <span className="font-semibold text-white">
                  @{c.users?.username ?? "user"}
                </span>{" "}
                {c.text}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={submit} className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder={user ? "Add a comment…" : "Log in to comment"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!user || posting}
          className="flex-1 p-2 rounded bg-zinc-800 border border-gray-700 focus:outline-none focus:border-red-500 disabled:opacity-60"
        />
        <button
          disabled={!user || posting || !text.trim()}
          className="px-3 py-2 rounded bg-red-500 hover:bg-red-600 disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  );
}
