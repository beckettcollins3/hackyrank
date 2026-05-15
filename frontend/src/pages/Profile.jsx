import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";
import Avatar from "../components/Avatar";
import TierBadge from "../components/TierBadge";
import EditProfileModal from "../components/EditProfileModal";
import TopBar from "../components/TopBar";
import { GridSkeleton } from "../components/Skeleton";
import { tierStyle, nextTier, progressToNext } from "../lib/tiers";
import {
  Settings,
  Share2,
  Heart,
  MessageCircle,
  Trophy,
  Flame,
  Award,
  LogOut,
  Pencil,
  MapPin,
  Zap,
} from "lucide-react";
import {
  userByUsername,
  videosForUser,
  isDemo,
  DEMO_VIDEOS,
} from "../demo/seed";
import { useToast } from "../lib/ToastContext";
import * as haptics from "../lib/haptics";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user: me, profile: myProfile, signOut, refreshProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0, likes: 0 });
  const [streak, setStreak] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(false);
  const demoMode = !!username && !!userByUsername(username);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");

    if (demoMode) {
      const u = userByUsername(username);
      setProfile(u);
      const v = videosForUser(u.id);
      setVideos(v);
      const totalLikes = v.reduce((a, x) => a + (x.likes_count ?? 0), 0);
      setCounts({
        followers: Math.floor(u.skill_score / 12) + 8,
        following: 24 + (u.skill_score % 41),
        likes: totalLikes,
      });
      setStreak(Math.max(3, Math.floor(u.skill_score / 200) % 30 + 3));
      setIsFollowing(false);
      setLoading(false);
      return;
    }

    let target = null;
    if (username) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      target = data;
    } else {
      target = myProfile;
    }

    if (!target) {
      setErr("User not found.");
      setLoading(false);
      return;
    }
    setProfile(target);

    const [{ data: vids }, { count: followers }, { count: following }] =
      await Promise.all([
        supabase
          .from("videos")
          .select(
            "id, video_url, caption, likes_count, comments_count, created_at"
          )
          .eq("user_id", target.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("following_id", target.id),
        supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", target.id),
      ]);

    const list = vids ?? [];
    const totalLikes = list.reduce((a, v) => a + (v.likes_count ?? 0), 0);
    setVideos(list);
    setCounts({
      followers: followers ?? 0,
      following: following ?? 0,
      likes: totalLikes,
    });
    setStreak(computeStreak(list));

    if (me && me.id !== target.id) {
      const { data: f } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", me.id)
        .eq("following_id", target.id)
        .maybeSingle();
      setIsFollowing(!!f);
    } else {
      setIsFollowing(false);
    }
    setLoading(false);
  }, [username, me, myProfile, demoMode]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = async () => {
    if (!profile) return;
    haptics.light();
    if (demoMode || isDemo(profile.id)) {
      const willFollow = !isFollowing;
      setIsFollowing(willFollow);
      setCounts((c) => ({
        ...c,
        followers: c.followers + (willFollow ? 1 : -1),
      }));
      if (willFollow) toast(`Following @${profile.username}`, { kind: "follow" });
      return;
    }
    if (!me || me.id === profile.id) return;
    if (isFollowing) {
      setIsFollowing(false);
      setCounts((c) => ({ ...c, followers: Math.max(0, c.followers - 1) }));
      await supabase
        .from("followers")
        .delete()
        .eq("follower_id", me.id)
        .eq("following_id", profile.id);
    } else {
      setIsFollowing(true);
      setCounts((c) => ({ ...c, followers: c.followers + 1 }));
      toast(`Following @${profile.username}`, { kind: "follow" });
      await supabase
        .from("followers")
        .insert({ follower_id: me.id, following_id: profile.id });
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Profile" bell dm />
        <ProfileSkeleton />
      </>
    );
  }
  if (err) {
    return (
      <>
        <TopBar title="Profile" back />
        <div className="p-6 text-hot">{err}</div>
      </>
    );
  }
  if (!profile) return null;

  const isMe = !demoMode && me?.id === profile.id;
  const ts = tierStyle(profile.rank_tier);
  const next = nextTier(profile.rank_tier);
  const prog = progressToNext(profile.skill_score, profile.rank_tier);

  return (
    <>
      <TopBar
        title={isMe ? "Me" : `@${profile.username}`}
        back={!isMe}
        bell={isMe}
        dm={isMe}
        right={
          isMe ? (
            <button
              onClick={() => signOut().then(() => navigate("/login"))}
              className="size-9 grid place-items-center rounded-full hover:bg-white/5"
              aria-label="Sign out"
            >
              <LogOut className="size-5" />
            </button>
          ) : null
        }
      />

      {/* Banner */}
      <div className={`relative h-32 ${ts.bg} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.18),transparent_60%)]" />
      </div>

      <div className="max-w-md mx-auto px-4 -mt-12 relative">
        <div className="flex items-end justify-between">
          <div className={`rounded-full p-1 ${ts.bg} ${ts.glow}`}>
            <Avatar
              src={profile.avatar_url}
              username={profile.username}
              tier={profile.rank_tier}
              size={88}
              className="border-[3px] border-graphite-900"
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            {isMe ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-full glass-pill hover:bg-white/10 text-sm font-medium"
                >
                  <Pencil className="size-3.5" /> Edit
                </button>
                <button
                  className="size-9 grid place-items-center rounded-full glass-pill"
                  aria-label="Settings"
                >
                  <Settings className="size-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleFollow}
                  className={`px-4 h-9 rounded-full text-sm font-bold active:scale-95 transition ${
                    isFollowing
                      ? "bg-graphite-700 text-ink-50"
                      : "bg-gradient-electric text-graphite-900 shadow-glow"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  className="size-9 grid place-items-center rounded-full glass-pill"
                  aria-label="Share profile"
                >
                  <Share2 className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-display font-bold tracking-tight">
            @{profile.username}
          </h1>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <TierBadge tier={profile.rank_tier} size="md" />
            {profile.region && (
              <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                <MapPin className="size-3 text-electric-400" />
                {profile.region}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-hot">
              <Flame className="size-3 fill-hot" />
              {streak} day streak
            </span>
          </div>
          {profile.bio && (
            <p className="mt-3 text-[14.5px] text-ink-50/90 text-pretty">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Stat
            label="Score"
            value={profile.skill_score?.toLocaleString() ?? "0"}
            icon={<Flame className="size-3.5 text-hot" />}
          />
          <Stat label="Clips" value={videos.length} />
          <Stat label="Followers" value={counts.followers} />
          <Stat label="Following" value={counts.following} />
        </div>

        {/* Progress to next tier */}
        {next && (
          <div className="mt-4 p-3 rounded-2xl glass">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-400">
                Progress to <span className="text-ink-50 font-semibold">{next}</span>
              </span>
              <span className="text-ink-400 tabular-nums">
                {Math.round(prog * 100)}%
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-graphite-700 overflow-hidden">
              <div
                className={`h-full ${ts.bg} transition-[width] duration-700`}
                style={{ width: `${prog * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick stats row */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl glass p-3 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-electric/30 grid place-items-center">
              <Heart className="size-4 text-hot fill-hot" />
            </div>
            <div>
              <div className="text-sm font-bold tabular-nums">{counts.likes}</div>
              <div className="text-[10.5px] text-ink-400 uppercase tracking-wide">Likes received</div>
            </div>
          </div>
          <div className="rounded-2xl glass p-3 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-neon/30 grid place-items-center">
              <Zap className="size-4 text-neon-400" />
            </div>
            <div>
              <div className="text-sm font-bold tabular-nums">{streak}d</div>
              <div className="text-[10.5px] text-ink-400 uppercase tracking-wide">Active streak</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-4">
          <h2 className="text-xs uppercase tracking-wider text-ink-400 mb-2">
            Achievements
          </h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
            <Achievement
              unlocked={videos.length >= 1}
              icon={<Flame className="size-5" />}
              label="First Clip"
            />
            <Achievement
              unlocked={counts.likes >= 10}
              icon={<Heart className="size-5" />}
              label="10 Likes"
            />
            <Achievement
              unlocked={counts.followers >= 5}
              icon={<Trophy className="size-5" />}
              label="5 Fans"
            />
            <Achievement
              unlocked={videos.length >= 10}
              icon={<Award className="size-5" />}
              label="10 Clips"
            />
            <Achievement
              unlocked={profile.rank_tier !== "Beginner"}
              icon={<MessageCircle className="size-5" />}
              label="Ranked Up"
            />
            <Achievement
              unlocked={streak >= 7}
              icon={<Zap className="size-5" />}
              label="7d Streak"
            />
          </div>
        </div>

        {/* Clip grid */}
        <div className="mt-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase tracking-wider text-ink-400">
              Clips ({videos.length})
            </h2>
          </div>
          {videos.length === 0 ? (
            <div className="rounded-2xl glass p-8 text-center">
              <p className="text-ink-400 text-sm">
                {isMe ? "No clips yet — drop your first one!" : "No clips yet."}
              </p>
              {isMe && (
                <Link
                  to="/upload"
                  className="inline-flex mt-3 px-4 py-2 rounded-full bg-gradient-electric text-graphite-900 text-sm font-bold shadow-glow"
                >
                  Upload now
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="relative aspect-[9/16] rounded-md overflow-hidden bg-graphite-700 group"
                >
                  <video
                    src={v.video_url}
                    muted
                    playsInline
                    preload="metadata"
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[11px] font-semibold drop-shadow">
                    <Heart className="size-3 fill-white" />
                    {v.likes_count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editing && isMe && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={async () => {
            await refreshProfile();
            await load();
          }}
        />
      )}
    </>
  );
}

function computeStreak(videos) {
  if (!videos?.length) return 0;
  const days = new Set();
  for (const v of videos) {
    const d = new Date(v.created_at);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 60; i++) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (days.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      // Allow 1-day gap for today
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function Stat({ label, value, icon }) {
  return (
    <div className="rounded-xl glass p-2.5 text-center">
      <div className="text-base font-bold tabular-nums flex items-center justify-center gap-1">
        {icon}
        {value}
      </div>
      <div className="text-[10.5px] text-ink-400 mt-0.5 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function Achievement({ unlocked, icon, label }) {
  return (
    <div
      className={`flex-shrink-0 w-20 rounded-2xl p-2.5 text-center border ${
        unlocked
          ? "glass border-electric-400/30 text-electric-400"
          : "bg-graphite-800 border-white/5 text-ink-500"
      }`}
    >
      <div className="mx-auto size-9 rounded-full grid place-items-center mb-1.5 bg-white/5">
        {icon}
      </div>
      <div className="text-[10px] font-semibold leading-tight">{label}</div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div>
      <div className="h-32 skeleton" />
      <div className="max-w-md mx-auto px-4 -mt-12">
        <div className="size-24 rounded-full skeleton" />
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl skeleton" />
          ))}
        </div>
        <div className="mt-5">
          <GridSkeleton />
        </div>
      </div>
    </div>
  );
}
