import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, Trophy } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import TopBar from "../components/TopBar";
import Avatar from "../components/Avatar";
import { RowSkeleton } from "../components/Skeleton";

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

export default function Notifications() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      setErr("");

      // My videos (so we can collect notifications about them)
      const { data: myVids } = await supabase
        .from("videos")
        .select("id, caption, video_url")
        .eq("user_id", user.id);
      const videoIds = (myVids ?? []).map((v) => v.id);
      const videoById = Object.fromEntries((myVids ?? []).map((v) => [v.id, v]));

      const [likes, comments, follows] = await Promise.all([
        videoIds.length
          ? supabase
              .from("likes")
              .select(
                "id, created_at, video_id, users:users!likes_user_id_fkey(username, avatar_url, rank_tier)"
              )
              .in("video_id", videoIds)
              .order("created_at", { ascending: false })
              .limit(30)
          : Promise.resolve({ data: [] }),
        videoIds.length
          ? supabase
              .from("comments")
              .select(
                "id, text, created_at, video_id, users:users!comments_user_id_fkey(username, avatar_url, rank_tier)"
              )
              .in("video_id", videoIds)
              .order("created_at", { ascending: false })
              .limit(30)
          : Promise.resolve({ data: [] }),
        supabase
          .from("followers")
          .select(
            "id, created_at, users:users!followers_follower_id_fkey(username, avatar_url, rank_tier)"
          )
          .eq("following_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      const all = [
        ...(likes.data ?? []).map((x) => ({
          type: "like",
          id: `l-${x.id}`,
          when: x.created_at,
          actor: x.users,
          video: videoById[x.video_id],
        })),
        ...(comments.data ?? []).map((x) => ({
          type: "comment",
          id: `c-${x.id}`,
          when: x.created_at,
          actor: x.users,
          video: videoById[x.video_id],
          text: x.text,
        })),
        ...(follows.data ?? []).map((x) => ({
          type: "follow",
          id: `f-${x.id}`,
          when: x.created_at,
          actor: x.users,
        })),
      ];

      all.sort((a, b) => new Date(b.when) - new Date(a.when));
      setEvents(all);
      setLoading(false);
    })().catch((e) => {
      setErr(e.message);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <>
        <TopBar title="Notifications" back />
        <div className="max-w-md mx-auto p-6">
          <p className="text-ink-400">
            <Link to="/login" className="text-electric-400 underline">
              Log in
            </Link>{" "}
            to see your activity.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Notifications" back />
      <div className="max-w-md mx-auto px-4 pt-2 mb-6">
        {loading ? (
          <RowSkeleton count={6} />
        ) : err ? (
          <p className="text-hot text-sm">{err}</p>
        ) : events.length === 0 ? (
          <div className="rounded-2xl glass p-8 text-center mt-6">
            <Trophy className="mx-auto size-9 text-ink-400 mb-2" />
            <p className="font-semibold">Quiet for now</p>
            <p className="text-ink-400 text-sm mt-1">
              When people like, comment on, or follow you, you'll see it here.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {events.map((ev) => (
              <EventRow key={ev.id} ev={ev} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function EventRow({ ev }) {
  const Icon =
    ev.type === "like" ? Heart : ev.type === "comment" ? MessageCircle : UserPlus;
  const accent =
    ev.type === "like"
      ? "text-hot fill-hot"
      : ev.type === "comment"
      ? "text-electric-400"
      : "text-neon-400";
  const verb =
    ev.type === "like"
      ? "liked your clip"
      : ev.type === "comment"
      ? `commented: "${(ev.text || "").slice(0, 60)}"`
      : "started following you";
  return (
    <li className="flex items-center gap-3 p-2.5 rounded-2xl glass">
      <div className="relative">
        <Avatar
          src={ev.actor?.avatar_url}
          username={ev.actor?.username}
          tier={ev.actor?.rank_tier}
          size={40}
        />
        <div className="absolute -bottom-1 -right-1 size-5 rounded-full grid place-items-center bg-graphite-900 border border-white/10">
          <Icon className={`size-3 ${accent}`} strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="font-semibold">@{ev.actor?.username ?? "user"}</span>{" "}
          <span className="text-ink-400">{verb}</span>
        </div>
        <div className="text-[11px] text-ink-500">{timeAgo(ev.when)} ago</div>
      </div>
      {ev.video && (
        <div className="size-10 rounded-md overflow-hidden bg-graphite-700">
          <video
            src={ev.video.video_url}
            muted
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
        </div>
      )}
    </li>
  );
}
