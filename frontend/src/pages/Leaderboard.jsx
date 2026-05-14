import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const TIER_BADGE = {
  Diamond: "bg-cyan-500/20 border-cyan-400 text-cyan-200",
  Platinum: "bg-slate-300/20 border-slate-200 text-slate-100",
  Gold: "bg-yellow-500/20 border-yellow-400 text-yellow-200",
  Silver: "bg-zinc-400/20 border-zinc-300 text-zinc-100",
  Bronze: "bg-amber-700/20 border-amber-500 text-amber-200",
};

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar_url, skill_score, rank_tier")
        .order("skill_score", { ascending: false })
        .limit(100);
      if (error) setErr(error.message);
      setUsers(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🏆 Leaderboard</h1>

      {loading && <p className="text-gray-400">Loading…</p>}
      {err && <p className="text-red-400 text-sm">{err}</p>}

      <ul className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden">
        {users.map((u, i) => (
          <li key={u.id} className="flex items-center gap-3 p-3 hover:bg-white/5">
            <span className="w-8 text-gray-400 text-sm tabular-nums">#{i + 1}</span>
            <Link
              to={`/u/${u.username}`}
              className="font-semibold hover:underline"
            >
              @{u.username}
            </Link>
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded border ${
                TIER_BADGE[u.rank_tier] ?? "border-gray-700 text-gray-300"
              }`}
            >
              {u.rank_tier}
            </span>
            <span className="text-sm text-gray-300 w-14 text-right tabular-nums">
              {u.skill_score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
