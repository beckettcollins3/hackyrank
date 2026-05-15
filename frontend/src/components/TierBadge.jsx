import { tierStyle } from "../lib/tiers";

export default function TierBadge({ tier, size = "sm", className = "" }) {
  const s = tierStyle(tier);
  const sizing =
    size === "lg"
      ? "px-3 py-1 text-sm"
      : size === "md"
      ? "px-2.5 py-0.5 text-xs"
      : "px-2 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${sizing} ${s.chip} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {tier}
    </span>
  );
}
