import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, TrendingUp, Heart, MessageCircle, MapPin, UserPlus } from "lucide-react";
import { supabase } from "../lib/supabase";
import TopBar from "../components/TopBar";
import Avatar from "../components/Avatar";
import TierBadge from "../components/TierBadge";
import { GridSkeleton } from "../components/Skeleton";
import {
  DEMO_VIDEOS,
  DEMO_USERS,
  COMMUNITIES,
  mixDemo,
} from "../demo/seed";

const HASHTAGS = ["stalls", "flow", "freestyle", "battle", "trick", "newbie", "squad", "challenge"];

export default function Explore() {
  const [q, setQ] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [tag, setTag] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      const { data, error } = await supabase
        .from("videos")
        .select(
          "id, caption, video_url, likes_count, comments_count, created_at, users:users!videos_user_id_fkey(username, avatar_url, rank_tier)"
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) setErr(error.message);
      const merged = mixDemo(data ?? [], DEMO_VIDEOS, 40);
      setVideos(merged);
      setLoading(false);
    })();
  }, []);

  const trending = useMemo(() => {
    const scored = videos.map((v) => ({
      ...v,
      score: (v.likes_count ?? 0) * 1 + (v.comments_count ?? 0) * 2,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [videos]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = trending;
    if (tag) list = list.filter((v) => v.caption?.toLowerCase().includes(`#${tag}`));
    if (needle)
      list = list.filter(
        (v) =>
          v.caption?.toLowerCase().includes(needle) ||
          v.users?.username?.toLowerCase().includes(needle)
      );
    return list;
  }, [trending, q, tag]);

  const suggested = useMemo(() => DEMO_USERS.slice(0, 6), []);

  return (
    <>
      <TopBar title="Explore" bell dm />
      <div className="max-w-md mx-auto px-4 pt-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search creators, captions, hashtags…"
            className="w-full h-11 pl-10 pr-3 rounded-2xl bg-graphite-800 border border-white/5 placeholder:text-ink-500 focus:outline-none focus:border-electric-400/60"
          />
        </div>

        {/* Hashtag chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
          <button
            onClick={() => setTag(null)}
            className={`flex-shrink-0 px-3 h-8 rounded-full text-xs font-semibold ${
              !tag
                ? "bg-gradient-electric text-graphite-900 shadow-glow"
                : "glass-pill text-ink-50"
            }`}
          >
            All
          </button>
          {HASHTAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t === tag ? null : t)}
              className={`flex-shrink-0 px-3 h-8 rounded-full text-xs font-semibold ${
                t === tag
                  ? "bg-gradient-electric text-graphite-900 shadow-glow"
                  : "glass-pill text-ink-50"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>

        {/* Communities row */}
        <h3 className="mt-5 mb-2 text-xs uppercase tracking-wider text-ink-400">
          Communities
        </h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
          {COMMUNITIES.map((c) => (
            <Link
              key={c.id}
              to="/leaderboard"
              className="flex-shrink-0 inline-flex items-center gap-2 px-3 h-10 rounded-2xl glass hover:bg-white/10 active:scale-[0.99]"
            >
              <span className="text-base">{c.emoji}</span>
              <div className="leading-tight">
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="text-[10px] text-ink-400 flex items-center gap-1">
                  <MapPin className="size-2.5" /> {c.region}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trending banner */}
        <div className="mt-5 rounded-2xl glass p-3 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-hot grid place-items-center shadow-glow-hot">
            <TrendingUp className="size-5 text-graphite-900" strokeWidth={3} />
          </div>
          <div>
            <div className="font-semibold">Trending now</div>
            <div className="text-xs text-ink-400">Sorted by likes + comments</div>
          </div>
        </div>

        {loading ? (
          <div className="mt-4">
            <GridSkeleton />
          </div>
        ) : err ? (
          <p className="mt-4 text-hot text-sm">{err}</p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 text-center text-ink-400 text-sm">
            Nothing matches that search yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {filtered.map((v) => (
              <Link
                key={v.id}
                to="/"
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-graphite-700 group active:scale-[0.99] transition"
              >
                <video
                  src={v.video_url}
                  muted
                  playsInline
                  preload="metadata"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full glass-pill text-[10px] font-semibold">
                  @{v.users?.username ?? "user"}
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-[11.5px] text-white line-clamp-2 drop-shadow font-medium">
                    {v.caption || "Untitled"}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-white/90">
                    <span className="flex items-center gap-1">
                      <Heart className="size-3 fill-white" />
                      {v.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="size-3" />
                      {v.comments_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Suggested users */}
        <h3 className="mt-6 mb-2 text-xs uppercase tracking-wider text-ink-400">
          Suggested for you
        </h3>
        <div className="space-y-1.5 mb-6">
          {suggested.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 p-2.5 rounded-2xl glass"
            >
              <Link to={`/u/${u.username}`}>
                <Avatar
                  src={u.avatar_url}
                  username={u.username}
                  tier={u.rank_tier}
                  size={44}
                  ring
                />
              </Link>
              <Link to={`/u/${u.username}`} className="flex-1 min-w-0">
                <div className="font-semibold truncate">@{u.username}</div>
                <div className="flex items-center gap-2 text-[11px] text-ink-400">
                  <TierBadge tier={u.rank_tier} size="sm" />
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {u.region}
                  </span>
                </div>
              </Link>
              <button className="px-3 h-8 rounded-full bg-gradient-electric text-graphite-900 text-xs font-bold shadow-glow active:scale-95 flex items-center gap-1">
                <UserPlus className="size-3.5" strokeWidth={3} />
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
