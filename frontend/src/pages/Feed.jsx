import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import VideoCard from "../components/VideoCard";
import { VideoSkeleton } from "../components/Skeleton";
import { Flame, Sparkles } from "lucide-react";

const PAGE_SIZE = 15;

export default function Feed() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [tab, setTab] = useState("foryou"); // "foryou" | "following"
  const scrollerRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");

    let q = supabase
      .from("videos")
      .select(
        "id, user_id, video_url, caption, likes_count, comments_count, created_at, users:users!videos_user_id_fkey(id, username, avatar_url, rank_tier)"
      )
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (tab === "following" && user) {
      const { data: f } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", user.id);
      const ids = (f ?? []).map((r) => r.following_id);
      if (ids.length === 0) {
        setVideos([]);
        setLikedIds(new Set());
        setLoading(false);
        return;
      }
      q = q.in("user_id", ids);
    }

    const { data, error } = await q;

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setVideos(data ?? []);

    if (user && data?.length) {
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
  }, [user, tab]);

  useEffect(() => {
    load();
  }, [load]);

  // Track which video is the active one via scroll
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll("[data-feed-item]"));
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.7) {
            const idx = Number(e.target.getAttribute("data-idx"));
            setActiveIdx(idx);
          }
        }
      },
      { root, threshold: [0.7] }
    );
    items.forEach((i) => obs.observe(i));
    return () => obs.disconnect();
  }, [videos]);

  const toggleLike = async (video) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const already = likedIds.has(video.id);
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
    const op = already
      ? supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("video_id", video.id)
      : supabase
          .from("likes")
          .insert({ user_id: user.id, video_id: video.id });
    const { error } = await op;
    if (error) load();
  };

  return (
    <div className="relative">
      {/* Top floating segmented tabs */}
      <div className="absolute top-0 inset-x-0 z-20 pt-[max(env(safe-area-inset-top),10px)] pb-2 pointer-events-none">
        <div className="mx-auto max-w-md flex items-center justify-center gap-5 text-sm font-semibold pointer-events-auto">
          <button
            onClick={() => setTab("following")}
            className={`flex items-center gap-1 ${
              tab === "following" ? "text-white" : "text-white/60"
            }`}
          >
            <Sparkles className="size-4" /> Following
          </button>
          <span className="size-1 rounded-full bg-white/30" />
          <button
            onClick={() => setTab("foryou")}
            className={`flex items-center gap-1 ${
              tab === "foryou" ? "text-white" : "text-white/60"
            }`}
          >
            <Flame className="size-4 text-hot" /> For You
          </button>
        </div>
        {/* underline */}
        <div className="mx-auto mt-1 h-0.5 w-10 rounded-full bg-white shadow-glow pointer-events-none"
             style={{ marginLeft: tab === "foryou" ? "calc(50% + 24px)" : "calc(50% - 64px)" }} />
      </div>

      {loading ? (
        <VideoSkeleton />
      ) : err ? (
        <div className="h-[100dvh] grid place-items-center p-6 text-center text-ink-50">
          <div>
            <p className="text-hot font-semibold mb-1">Feed unavailable</p>
            <p className="text-sm text-ink-400">{err}</p>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <EmptyFeed tab={tab} />
      ) : (
        <div
          ref={scrollerRef}
          className="feed-scroller h-[100dvh] overflow-y-scroll"
        >
          {videos.map((v, i) => (
            <div key={v.id} data-feed-item data-idx={i}>
              <VideoCard
                video={v}
                liked={likedIds.has(v.id)}
                onLike={() => toggleLike(v)}
                active={i === activeIdx}
                muted={muted}
                setMuted={setMuted}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyFeed({ tab }) {
  return (
    <div className="h-[100dvh] grid place-items-center p-6 text-center">
      <div className="space-y-4">
        <div className="mx-auto size-20 rounded-3xl bg-gradient-electric grid place-items-center shadow-glow">
          <Flame className="size-9 text-graphite-900" />
        </div>
        <h2 className="text-2xl font-display font-bold">
          {tab === "following" ? "Nobody you follow yet" : "No clips yet"}
        </h2>
        <p className="text-ink-400 text-sm max-w-xs mx-auto">
          {tab === "following"
            ? "Find creators on Explore and tap Follow."
            : "Be the first to drop a clip and start the leaderboard."}
        </p>
        <a
          href="/upload"
          className="inline-flex px-5 py-2.5 rounded-full bg-gradient-electric text-graphite-900 font-bold shadow-glow active:scale-95"
        >
          Upload your first clip
        </a>
      </div>
    </div>
  );
}
