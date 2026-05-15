import { useEffect, useMemo, useState } from "react";
import { Heart, UserPlus, MessageCircle, TrendingUp, Flame } from "lucide-react";
import { DEMO_USERS, DEMO_VIDEOS, COMMUNITIES } from "../demo/seed";

const ICONS = {
  drop: Flame,
  like: Heart,
  follow: UserPlus,
  comment: MessageCircle,
  trending: TrendingUp,
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildEvents() {
  // Generate a fresh batch each mount so the ticker always feels new
  const out = [];
  for (let i = 0; i < 18; i++) {
    const r = Math.random();
    if (r < 0.3) {
      const u = pick(DEMO_USERS);
      out.push({
        kind: "drop",
        text: `@${u.username} just dropped a clip`,
      });
    } else if (r < 0.55) {
      const u = pick(DEMO_USERS);
      const v = pick(DEMO_VIDEOS);
      out.push({
        kind: "like",
        text: `@${u.username} liked @${v.users.username}'s combo`,
      });
    } else if (r < 0.75) {
      const a = pick(DEMO_USERS);
      const b = pick(DEMO_USERS);
      if (a.id !== b.id)
        out.push({
          kind: "follow",
          text: `@${a.username} followed @${b.username}`,
        });
    } else if (r < 0.9) {
      const c = pick(COMMUNITIES);
      out.push({
        kind: "trending",
        text: `Trending in ${c.name} ${c.emoji}`,
      });
    } else {
      const u = pick(DEMO_USERS);
      out.push({
        kind: "comment",
        text: `@${u.username} commented "this is filthy 🔥"`,
      });
    }
  }
  return out;
}

export default function LiveActivityTicker() {
  const events = useMemo(buildEvents, []);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % events.length);
    }, 2600);
    return () => clearInterval(t);
  }, [events.length]);

  const ev = events[idx];
  const Icon = ICONS[ev.kind] ?? Flame;

  return (
    <div
      key={idx}
      className="pointer-events-none mx-auto inline-flex items-center gap-2 px-3 h-8 rounded-full glass-strong shadow-card animate-fade-up max-w-[90%]"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full rounded-full bg-neon-400 opacity-70 animate-pulse-soft" />
        <span className="relative rounded-full size-2 bg-neon-400" />
      </span>
      <Icon
        className={`size-3.5 ${
          ev.kind === "like"
            ? "fill-hot text-hot"
            : ev.kind === "trending"
            ? "text-electric-400"
            : ev.kind === "follow"
            ? "text-neon-400"
            : "text-white"
        }`}
      />
      <span className="text-[12px] font-medium truncate text-white drop-shadow">
        {ev.text}
      </span>
    </div>
  );
}
