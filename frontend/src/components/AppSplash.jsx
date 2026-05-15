import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const SHOWN_KEY = "hackyrank.splash.shown.v1";

/**
 * One-time animated brand intro. Mounted from main.jsx. Once it fades out,
 * sessionStorage is set so route changes don't re-trigger it. Reload to
 * see it again.
 */
export default function AppSplash() {
  const [phase, setPhase] = useState(() => {
    try {
      return sessionStorage.getItem(SHOWN_KEY) === "1" ? "gone" : "enter";
    } catch {
      return "enter";
    }
  });

  useEffect(() => {
    if (phase === "gone") return;
    const t1 = setTimeout(() => setPhase("exit"), 850);
    const t2 = setTimeout(() => {
      setPhase("gone");
      try {
        sessionStorage.setItem(SHOWN_KEY, "1");
      } catch {}
    }, 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center pointer-events-none transition-opacity duration-500 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "#0A0A0F" }}
    >
      {/* Ambient blobs */}
      <div className="absolute -top-32 -left-24 size-[26rem] rounded-full bg-electric/30 blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-0 -right-24 size-[24rem] rounded-full bg-hot/25 blur-3xl animate-pulse-soft" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[18rem] rounded-full bg-neon/15 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <div className="size-24 rounded-3xl bg-gradient-electric grid place-items-center shadow-glow animate-scale-in">
          <Flame
            className="size-12 text-graphite-900"
            strokeWidth={3}
          />
        </div>
        <div className="mt-5 font-display font-black text-3xl tracking-tight animate-fade-up">
          HackyRank
        </div>
        <div className="mt-1 text-[11px] tracking-[0.28em] text-ink-400 uppercase animate-fade-up">
          Footbag · Ranked · Real
        </div>
      </div>
    </div>
  );
}
