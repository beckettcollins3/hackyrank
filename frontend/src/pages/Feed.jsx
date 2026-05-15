import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import VideoCard from "../components/VideoCard";
import { VideoSkeleton } from "../components/Skeleton";
import LiveActivityTicker from "../components/LiveActivityTicker";
import { Flame, Sparkles, RefreshCw } from "lucide-react";
import { DEMO_VIDEOS, mixDemo, isDemo } from "../demo/seed";
import { useToast } from "../lib/ToastContext";
import * as haptics from "../lib/haptics";

const PAGE_SIZE = 15;
const FEED_TARGET = 20;
const PULL_THRESHOLD = 70;

export default function Feed() {
  const { user } = useAuth();
  const toast = useToast();

  const [realVideos, setRealVideos] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [demoLiked, setDemoLiked] = useState(new Set());
  const [demoCounts, setDemoCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [tab, setTab] = useState("foryou");
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const scrollerRef = useRef(null);
  const pullStartRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
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
        setRealVideos([]);
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
    setRealVideos(data ?? []);

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

  const videos = useMemo(() => {
    if (tab === "following") return realVideos;
    return mixDemo(realVideos, DEMO_VIDEOS, FEED_TARGET);
  }, [realVideos, tab]);

  // Active video tracking
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

  // Pull-to-refresh
  const onScrollerTouchStart = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (el.scrollTop <= 0) {
      pullStartRef.current = e.touches[0].clientY;
    }
  };
  const onScrollerTouchMove = (e) => {
    if (pullStartRef.current == null) return;
    const dy = e.touches[0].clientY - pullStartRef.current;
    if (dy > 0) setPullY(Math.min(dy * 0.5, 100));
  };
  const onScrollerTouchEnd = async () => {
    const should = pullY >= PULL_THRESHOLD;
    setPullY(0);
    pullStartRef.current = null;
    if (should) {
      setRefreshing(true);
      haptics.light();
      await load(true);
      setRefreshing(false);
      toast("Feed refreshed", { kind: "success" });
    }
  };

  const toggleLike = async (video) => {
    if (!user && !isDemo(video.id)) {
      window.location.href = "/login";
      return;
    }
    haptics.pop();

    if (isDemo(video.id)) {
      const already = demoLiked.has(video.id);
      setDemoLiked((prev) => {
        const next = new Set(prev);
        already ? next.delete(video.id) : next.add(video.id);
        return next;
      });
      setDemoCounts((prev) => {
        const cur =
          prev[video.id] ?? { likes: video.likes_count, comments: video.comments_count };
        return {
          ...prev,
          [video.id]: { ...cur, likes: cur.likes + (already ? -1 : 1) },
        };
      });
      if (!already) toast("Liked", { kind: "like" });
      return;
    }

    const already = likedIds.has(video.id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      already ? next.delete(video.id) : next.add(video.id);
      return next;
    });
    setRealVideos((prev) =>
      prev.map((v) =>
        v.id === video.id
          ? { ...v, likes_count: v.likes_count + (already ? -1 : 1) }
          : v
      )
    );
    if (!already) toast("Liked", { kind: "like" });
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
    if (error) load(true);
  };

  const decorated = videos.map((v) => {
    if (isDemo(v.id) && demoCounts[v.id]) {
      return { ...v, likes_count: demoCounts[v.id].likes };
    }
    return v;
  });

  const isLiked = (id) => (isDemo(id) ? demoLiked.has(id) : likedIds.has(id));
  const pullPct = Math.min(1, pullY / PULL_THRESHOLD);

  return (
    <div className="relative">
      {/* Top floating segmented tabs + ticker */}
      <div className="absolute top-0 inset-x-0 z-20 pt-[max(env(safe-area-inset-top),10px)] pb-2 pointer-events-none flex flex-col items-center gap-2">
        <div className="mx-auto max-w-md flex items-center justify-center gap-5 text-sm font-semibold pointer-events-auto">
          <button
            onClick={() => {
              haptics.tap();
              setTab("following");
            }}
            className={`flex items-center gap-1 transition ${
              tab === "following" ? "text-white" : "text-white/60"
            }`}
          >
            <Sparkles className="size-4" /> Following
          </button>
          <span className="size-1 rounded-full bg-white/30" />
          <button
            onClick={() => {
              haptics.tap();
              setTab("foryou");
            }}
            className={`flex items-center gap-1 transition ${
              tab === "foryou" ? "text-white" : "text-white/60"
            }`}
          >
            <Flame className="size-4 text-hot" /> For You
          </button>
        </div>
        <LiveActivityTicker />
      </div>

      {/* Pull-to-refresh indicator */}
      {(pullY > 0 || refreshing) && (
        <div
          className="absolute inset-x-0 top-[max(env(safe-area-inset-top),10px)] z-10 grid place-items-center pointer-events-none"
          style={{ transform: `translateY(${pullY}px)` }}
        >
          <div className="size-9 rounded-full glass-strong grid place-items-center">
            <RefreshCw
              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              style={{ transform: `rotate(${pullPct * 360}deg)` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <VideoSkeleton />
      ) : err ? (
        <div className="h-[100dvh] grid place-items-center p-6 text-center text-ink-50">
          <div>
            <p className="text-hot font-semibold mb-1">Feed unavailable</p>
            <p className="text-sm text-ink-400">{err}</p>
          </div>
        </div>
      ) : decorated.length === 0 ? (
        <EmptyFeed tab={tab} />
      ) : (
        <div
          ref={scrollerRef}
          className="feed-scroller h-[100dvh] overflow-y-scroll"
          onTouchStart={onScrollerTouchStart}
          onTouchMove={onScrollerTouchMove}
          onTouchEnd={onScrollerTouchEnd}
        >
          {decorated.map((v, i) => (
            <div key={v.id} data-feed-item data-idx={i}>
              <VideoCard
                video={v}
                liked={isLiked(v.id)}
                onLike={() => toggleLike(v)}
                active={i === activeIdx}
                preload={i === activeIdx || i === activeIdx + 1 ? "auto" : "metadata"}
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
          <Sparkles className="size-9 text-graphite-900" />
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
