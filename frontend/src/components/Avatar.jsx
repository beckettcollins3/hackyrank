import { tierStyle } from "../lib/tiers";

export default function Avatar({
  src,
  username,
  tier,
  size = 40,
  ring = false,
  className = "",
}) {
  const s = tier ? tierStyle(tier) : null;
  const initial = (username || "?").slice(0, 1).toUpperCase();
  const px = `${size}px`;
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-graphite-700 overflow-hidden ${
        ring && s ? `ring-2 ${s.ring.replace("ring-2 ", "")}` : ""
      } ${className}`}
      style={{ width: px, height: px }}
    >
      {src ? (
        <img
          src={src}
          alt={username || ""}
          className="size-full object-cover"
        />
      ) : (
        <span
          className="font-semibold text-ink-50"
          style={{ fontSize: Math.max(10, size * 0.4) }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
