import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Crown, Trophy, Flame } from "lucide-react";
import { supabase } from "../lib/supabase";
import Avatar from "../components/Avatar";
import TierBadge from "../components/TierBadge";
import TopBar from "../components/TopBar";
import { RowSkeleton } from "../components/Skeleton";
import { tierStyle } from "../lib/tiers";
import { useAuth } from "../lib/AuthContext";

const TABS = [
  { key: "global", label: "Global" },
  { key: "weekly", label: "Weekly" },
  { key: "friends", label: "Friends" },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("global");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");

      if (tab === "weekly") {
        // Approximate weekly ranking: sum likes received on videos created in
        // the last 7 days. This is computed client-side from views the user
        // can already read under RLS, so no extra schema is needed.
        const since = new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();
        const { data, error } = await supabase
          .from("videos")
          .select("user_id, likes_count, comments_count, users:users!videos_user_id_fkey(id, username, avatar_url, rank_tier)")
          .gte("created_at", since)
          .limit(500);
        if (cancelled) return;
        if (error) {
          setErr(error.message);
          setLoading(false);
          return;
        }
        const map = new Map();
        for (const v of data ?? []) {
          const u = v.users;
          if (!u) continue;
          const score = (v.likes_count ?? 0) + 2 * (v.comments_count ?? 0);
          const cur = map.get(u.id) ?? {
            id: u.id,
            username: u.username,
            avatar_url: u.avatar_url,
            rank_tier: u.rank_tier,
            skill_score: 0,
          };
          cur.skill_score += score;
          map.set(u.id, cur);
        }
        const arr = [...map.values()].sort(
          (a, b) => b.skill_score - a.skill_score
        );
        setUsers(arr.slice(0, 100));
        setLoading(false);
        return;
      }

      if (tab === "friends" && user) {
        const { data: f } = await supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", user.id);
        const ids = (f ?? []).map((r) => r.following_id);
        const allIds = [...new Set([user.id, ...ids])];
        if (allIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("users")
          .select("id, username, avatar_url, skill_score, rank_tier")
          .in("id", allIds)
          .order("skill_score", { ascending: false });
        if (cancelled) return;
        if (error) {
          setErr(error.message);
          setLoading(false);
          return;
        }
        setUsers(data ?? []);
        setLoading(false);
        return;
      }

      // Global
      const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar_url, skill_score, rank_tier")
        .order("skill_score", { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (error) setErr(error.message);
      setUsers(data ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, user]);

  const podium = useMemo(() => users.slice(0, 3), [users]);
  const rest = useMemo(() => users.slice(3), [users]);

  return (
    <>
      <TopBar title="Leaderboard" bell dm />

      <div className="max-w-md mx-auto px-4 pt-2">
        {/* Tabs */}
        <div className="relative flex p-1 glass rounded-2xl mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex-1 h-9 rounded-xl text-sm font-semibold transition ${
                tab === t.key
                  ? "bg-gradient-electric text-graphite-900 shadow-glow"
                  : "text-ink-400 hover:text-ink-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <RowSkeleton count={8} />
        ) : err ? (
          <p className="text-hot text-sm">{err}</p>
        ) : users.length === 0 ? (
          <EmptyLeaderboard tab={tab} />
        ) : (
          <>
            {podium.length > 0 && <Podium users={podium} />}
            {rest.length > 0 && (
              <div className="mt-4 space-y-1.5">
                {rest.map((u, i) => (
                  <Row key={u.id} u={u} rank={i + 4} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Podium({ users }) {
  // Order on screen: 2nd, 1st, 3rd
  const [first, second, third] = users;
  const order = [second, first, third].filter(Boolean);
  const heights = [128, 160, 112];
  const ranks = [2, 1, 3];
  return (
    <div className="mt-2 mb-4 grid grid-cols-3 gap-2 items-end">
      {order.map((u, i) => {
        const r = ranks[i];
        const h = heights[i];
        const ts = tierStyle(u.rank_tier);
        return (
          <Link
            key={u.id}
            to={`/u/${u.username}`}
            className="flex flex-col items-center group"
          >
            <div className="relative">
              {r === 1 && (
                <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 size-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
              )}
              <div className={`rounded-full p-[3px] ${ts.bg} ${r === 1 ? ts.glow : ""}`}>
                <Avatar
                  src={u.avatar_url}
                  username={u.username}
                  tier={u.rank_tier}
                  size={r === 1 ? 72 : 56}
                  className="border-2 border-graphite-900"
                />
              </div>
            </div>
            <div className="mt-1.5 text-sm font-bold truncate max-w-full px-1">
              @{u.username}
            </div>
            <div className="text-[11px] text-ink-400 tabular-nums">
              {u.skill_score?.toLocaleString()} pts
            </div>
            <div
              className={`mt-2 w-full rounded-t-xl ${ts.bg} grid place-items-start pt-2 font-display font-black text-lg text-graphite-900 ${
                r === 1 ? "shadow-glow" : ""
              }`}
              style={{ height: h }}
            >
              <span className="w-full text-center">{r}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function Row({ u, rank }) {
  const ts = tierStyle(u.rank_tier);
  return (
    <Link
      to={`/u/${u.username}`}
      className="flex items-center gap-3 p-2.5 rounded-2xl glass hover:bg-white/10 active:scale-[0.99] transition"
    >
      <span className="w-7 text-ink-400 text-sm font-semibold tabular-nums text-center">
        {rank}
      </span>
      <Avatar
        src={u.avatar_url}
        username={u.username}
        tier={u.rank_tier}
        size={40}
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">@{u.username}</div>
        <TierBadge tier={u.rank_tier} size="sm" />
      </div>
      <div className="text-right">
        <div className="text-sm font-bold tabular-nums">
          {u.skill_score?.toLocaleString() ?? 0}
        </div>
        <div className="text-[10px] text-ink-400 uppercase tracking-wide flex items-center justify-end gap-1">
          <Flame className={`size-3 ${ts.text}`} /> pts
        </div>
      </div>
    </Link>
  );
}

function EmptyLeaderboard({ tab }) {
  return (
    <div className="rounded-2xl glass p-8 text-center">
      <Trophy className="mx-auto size-9 text-ink-400 mb-2" />
      <p className="text-ink-50 font-semibold">No rankings yet</p>
      <p className="text-ink-400 text-sm mt-1">
        {tab === "friends"
          ? "Follow some creators to see them here."
          : tab === "weekly"
          ? "No clips this week. Upload one to claim #1."
          : "Be the first on the global board."}
      </p>
    </div>
  );
}
