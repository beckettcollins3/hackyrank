import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { tierStyle, TIER_ORDER } from "../lib/tiers";
import { Trophy, Sparkles } from "lucide-react";
import { success as hapticSuccess } from "../lib/haptics";

const SEEN_KEY = "hackyrank.lastSeenTier.v1";

/**
 * Watches the signed-in user's tier and shows a celebration overlay the
 * first time we see them at a higher tier than last seen.
 */
export default function RankUpModal() {
  const { profile } = useAuth();
  const [shown, setShown] = useState(null); // { from, to } | null

  useEffect(() => {
    if (!profile?.rank_tier) return;
    let lastSeen = null;
    try {
      lastSeen = localStorage.getItem(SEEN_KEY);
    } catch {}
    const lastIdx = lastSeen ? TIER_ORDER.indexOf(lastSeen) : -1;
    const curIdx = TIER_ORDER.indexOf(profile.rank_tier);
    if (lastIdx >= 0 && curIdx > lastIdx) {
      setShown({ from: TIER_ORDER[lastIdx], to: profile.rank_tier });
      hapticSuccess();
    }
    try {
      localStorage.setItem(SEEN_KEY, profile.rank_tier);
    } catch {}
  }, [profile?.rank_tier]);

  if (!shown) return null;
  const ts = tierStyle(shown.to);

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center p-6 animate-fade-in"
      onClick={() => setShown(null)}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      <div className="relative w-full max-w-sm rounded-3xl glass-strong p-6 text-center shadow-card animate-scale-in">
        {/* Confetti */}
        <Sparkles className="absolute -top-3 -left-2 size-6 text-electric-400 animate-pulse-soft" />
        <Sparkles className="absolute -top-2 right-3 size-5 text-hot animate-pulse-soft" />
        <Sparkles className="absolute bottom-4 left-3 size-4 text-neon-400 animate-pulse-soft" />

        <div className="text-xs uppercase tracking-[0.25em] text-ink-400 mb-3">
          Rank up
        </div>

        <div
          className={`mx-auto size-24 rounded-3xl ${ts.bg} grid place-items-center shadow-glow mb-4`}
        >
          <Trophy className="size-12 text-graphite-900" strokeWidth={3} />
        </div>

        <h2 className="text-2xl font-display font-black tracking-tight">
          You're now <span className={ts.text}>{shown.to}</span>
        </h2>
        <p className="mt-2 text-ink-50/80 text-sm">
          You climbed from <span className="font-semibold">{shown.from}</span>.
          Keep posting to lock the tier in.
        </p>

        <button
          onClick={() => setShown(null)}
          className="mt-5 w-full h-11 rounded-2xl bg-gradient-electric text-graphite-900 font-bold shadow-glow active:scale-[0.99]"
        >
          Let's go
        </button>
      </div>
    </div>
  );
}
