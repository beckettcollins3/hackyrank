import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

let nextId = 1;

/**
 * Drop in next to a like button. Call `trigger()` (returned from the
 * useFloatingHearts() hook) to emit a burst of small floating hearts that
 * rise and fade.
 */
export default function FloatingHearts({ hearts, onDone }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible z-10">
      {hearts.map((h) => (
        <SingleHeart key={h.id} heart={h} onDone={onDone} />
      ))}
    </div>
  );
}

function SingleHeart({ heart, onDone }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = requestAnimationFrame(() => setPhase(1));
    const t2 = setTimeout(() => onDone?.(heart.id), 1200);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
    };
  }, [heart.id, onDone]);
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-[1100ms] ease-out"
      style={{
        left: "50%",
        top: "50%",
        transform: phase
          ? `translate(calc(-50% + ${heart.dx}px), -120px) scale(1)`
          : "translate(-50%, -50%) scale(0.5)",
        opacity: phase ? 0 : 1,
      }}
    >
      <Heart
        className="text-hot fill-hot drop-shadow-[0_0_8px_rgba(255,61,113,0.5)]"
        style={{ width: heart.size, height: heart.size }}
        strokeWidth={1.5}
      />
    </div>
  );
}

export function makeHeartBurst() {
  const count = 3 + Math.floor(Math.random() * 2);
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: nextId++,
      dx: (Math.random() - 0.5) * 60,
      size: 18 + Math.floor(Math.random() * 12),
    });
  }
  return out;
}
