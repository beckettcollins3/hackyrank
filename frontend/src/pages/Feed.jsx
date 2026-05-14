import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import VideoCard from "../components/VideoCard";

const PAGE_SIZE = 10;

export default function Feed() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const { data, error } = await supabase
      .from("videos")
      .select(
        "id, user_id, video_url, caption, likes_count, comments_count, created_at, users:users!videos_user_id_fkey(id, username, avatar_url, rank_tier)"
      )
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setVideos(data ?? []);

    if (user && data && data.length) {
      const ids = data.map((v) => v.id);
      const { data: myLikes } = await supabase
        .from("likes")
        .select("video_id")
        .eq("user_id", user.id)
        .in("video_id", ids);
      setLikedIds(new Set((myLikes ?? []).map((l) => l.video_id)));
    } else {
      setLikedIds(new Set());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async (video) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const already = likedIds.has(video.id);

    // Optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      already ? next.delete(video.id) : next.add(video.id);
      return next;
    });
    setVideos((prev) =>
      prev.map((v) =>
        v.id === video.id
          ? { ...v, likes_count: v.likes_count + (already ? -1 : 1) }
          : v
      )
    );

    if (already) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", video.id);
      if (error) load();
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: user.id, video_id: video.id });
      if (error) load();
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center text-gray-400">
        Loading feed…
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6 text-red-400">
        Couldn’t load feed: {err}
        <p className="text-gray-500 text-sm mt-2">
          Did you run <code>supabase/schema.sql</code> and set the env vars?
        </p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="h-[calc(100vh-56px)] flex flex-col items-center justify-center text-gray-400 gap-3">
        <p>No clips yet. Be the first to post.</p>
        <a href="/upload" className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded">
          Upload a clip
        </a>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] overflow-y-scroll snap-y snap-mandatory">
      {videos.map((v) => (
        <VideoCard
          key={v.id}
          video={v}
          liked={likedIds.has(v.id)}
          onLike={() => toggleLike(v)}
        />
      ))}
    </div>
  );
}
