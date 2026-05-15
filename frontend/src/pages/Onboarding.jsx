import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Globe2,
  Trophy,
  Video,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const ONBOARDED_KEY = "hackyrank.onboarded.v1";

export function hasOnboarded() {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboarded() {
  try {
    localStorage.setItem(ONBOARDED_KEY, "1");
  } catch {}
}

const SLIDES = [
  {
    icon: Flame,
    tint: "from-electric-400 via-neon-400 to-hot",
    title: "Welcome to HackyRank",
    body: "The ranked social home for the footbag community. Drop clips. Get ranked. Earn the badge.",
    cta: "Let's go",
  },
  {
    icon: Globe2,
    tint: "from-electric-400 to-hot",
    title: "Compete globally",
    body: "Stack up against freestylers from Tysons to Virginia Tech to anywhere in the world.",
    cta: "Next",
  },
  {
    icon: Trophy,
    tint: "from-yellow-300 via-hot to-electric-400",
    title: "Climb the ranks",
    body: "Beginner → Street Juggler → Freestyler → Pro Footbagger → Elite → Legend. Every like, comment, and clip moves you up.",
    cta: "Next",
  },
  {
    icon: Video,
    tint: "from-neon-400 to-electric-400",
    title: "Post your combos",
    body: "Stalls, axels, flow, paradox. Upload in seconds, get reactions in real time.",
    cta: "Next",
  },
  {
    icon: Sparkles,
    tint: "from-hot via-electric-400 to-neon-400",
    title: "Build your reputation",
    body: "Tier badges, streaks, achievements. Real status the moment you sign up.",
    cta: "Create my account",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const startX = useRef(null);

  useEffect(() => {
    if (hasOnboarded()) navigate("/", { replace: true });
  }, [navigate]);

  const total = SLIDES.length;
  const slide = SLIDES[idx];
  const Icon = slide.icon;

  const next = () => {
    if (idx >= total - 1) {
      markOnboarded();
      navigate("/signup", { replace: true });
    } else {
      setIdx((i) => Math.min(i + 1, total - 1));
    }
  };
  const prev = () => setIdx((i) => Math.max(i - 1, 0));

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    startX.current = null;
  };

  const skip = () => {
    markOnboarded();
    navigate("/signup", { replace: true });
  };

  return (
    <div
      className="min-h-[100dvh] relative overflow-hidden flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Ambient gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 size-[28rem] rounded-full bg-electric/25 blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 -right-24 size-[26rem] rounded-full bg-hot/20 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[30rem] rounded-full bg-neon/15 blur-3xl animate-pulse-soft" />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),18px)]">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-2xl bg-gradient-electric grid place-items-center shadow-glow">
            <Flame className="size-4 text-graphite-900" strokeWidth={3} />
          </div>
          <span className="font-display font-black tracking-tight">HackyRank</span>
        </div>
        <button
          onClick={skip}
          className="text-ink-400 text-sm hover:text-ink-50 active:scale-95"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div
        key={idx}
        className="flex-1 flex flex-col justify-center px-6 animate-fade-up"
      >
        <div className={`size-24 rounded-3xl bg-gradient-to-br ${slide.tint} grid place-items-center shadow-glow mb-6`}>
          <Icon className="size-12 text-graphite-900" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-display font-black tracking-tight leading-[1.05] text-balance">
          {slide.title}
        </h1>
        <p className="mt-4 text-ink-50/80 text-[16px] text-pretty max-w-sm">
          {slide.body}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pb-3">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-8 bg-gradient-electric shadow-glow" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-[max(env(safe-area-inset-bottom),20px)] space-y-2">
        <button
          onClick={next}
          className="w-full h-12 rounded-2xl bg-gradient-electric text-graphite-900 font-bold shadow-glow active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          {slide.cta}
          <ChevronRight className="size-5" strokeWidth={3} />
        </button>
        <button
          onClick={() => {
            markOnboarded();
            navigate("/login", { replace: true });
          }}
          className="w-full h-11 text-sm text-ink-400 hover:text-ink-50"
        >
          I already have an account
        </button>
      </div>
    </div>
  );
}
