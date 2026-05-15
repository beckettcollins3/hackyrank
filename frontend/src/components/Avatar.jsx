import { tierStyle } from "../lib/tiers";
import { stringHue } from "../demo/seed";

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
  const hue = stringHue(username);
  const bg = `linear-gradient(135deg, hsl(${hue} 80% 38%) 0%, hsl(${(hue + 60) % 360} 75% 18%) 100%)`;
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${
        ring && s ? `ring-2 ${s.ring.replace("ring-2 ", "")}` : ""
      } ${className}`}
      style={{ width: px, height: px, background: src ? "transparent" : bg }}
    >
      {src ? (
        <img src={src} alt={username || ""} className="size-full object-cover" />
      ) : (
        <span
          className="font-bold text-white drop-shadow"
          style={{ fontSize: Math.max(11, size * 0.42), letterSpacing: "-0.02em" }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
