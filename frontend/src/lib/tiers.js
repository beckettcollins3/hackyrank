// Shared tier metadata. Server is the source of truth for assignment;
// this is for visual styling only.

export const TIER_ORDER = [
  "Beginner",
  "Street Juggler",
  "Freestyler",
  "Pro Footbagger",
  "Elite",
  "Legend",
];

export const TIER_THRESHOLDS = {
  Beginner: 0,
  "Street Juggler": 100,
  Freestyler: 500,
  "Pro Footbagger": 1500,
  Elite: 5000,
  Legend: 15000,
};

export const TIER_STYLES = {
  Beginner: {
    chip: "bg-graphite-700 border-graphite-500 text-ink-50",
    ring: "ring-2 ring-graphite-500",
    bg: "bg-gradient-tier-beginner",
    glow: "shadow-none",
    text: "text-ink-50",
  },
  "Street Juggler": {
    chip: "bg-electric/10 border-electric/40 text-electric-400",
    ring: "ring-2 ring-electric-400/70",
    bg: "bg-gradient-tier-street",
    glow: "shadow-[0_0_20px_rgba(0,217,255,0.35)]",
    text: "text-electric-400",
  },
  Freestyler: {
    chip: "bg-neon/10 border-neon/40 text-neon-400",
    ring: "ring-2 ring-neon-400/70",
    bg: "bg-gradient-tier-freestyle",
    glow: "shadow-glow-neon",
    text: "text-neon-400",
  },
  "Pro Footbagger": {
    chip: "bg-yellow-400/10 border-yellow-400/50 text-yellow-300",
    ring: "ring-2 ring-yellow-300/70",
    bg: "bg-gradient-tier-pro",
    glow: "shadow-[0_0_24px_rgba(255,211,0,0.45)]",
    text: "text-yellow-300",
  },
  Elite: {
    chip: "bg-fuchsia-500/10 border-fuchsia-400/50 text-fuchsia-300",
    ring: "ring-2 ring-fuchsia-400/70",
    bg: "bg-gradient-tier-elite",
    glow: "shadow-[0_0_28px_rgba(111,0,255,0.45)]",
    text: "text-fuchsia-300",
  },
  Legend: {
    chip: "bg-hot/10 border-hot/50 text-hot",
    ring: "ring-2 ring-hot/70",
    bg: "bg-gradient-tier-legend",
    glow: "shadow-glow-hot",
    text: "text-hot",
  },
};

export function tierStyle(tier) {
  return TIER_STYLES[tier] ?? TIER_STYLES.Beginner;
}

export function nextTier(tier) {
  const i = TIER_ORDER.indexOf(tier);
  return i >= 0 && i < TIER_ORDER.length - 1 ? TIER_ORDER[i + 1] : null;
}

export function progressToNext(score, currentTier) {
  const nt = nextTier(currentTier);
  if (!nt) return 1;
  const lo = TIER_THRESHOLDS[currentTier] ?? 0;
  const hi = TIER_THRESHOLDS[nt];
  if (score >= hi) return 1;
  return Math.max(0, Math.min(1, (score - lo) / (hi - lo)));
}
