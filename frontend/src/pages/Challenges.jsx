import { useEffect, useState } from "react";
import {
  Trophy,
  Flame,
  Plus,
  Check,
  Zap,
  CalendarDays,
  Target,
} from "lucide-react";
import TopBar from "../components/TopBar";
import {
  todaysChallenge,
  weeklyChallenge,
  getProgress,
  bumpProgress,
  claim,
} from "../lib/challenges";
import { useToast } from "../lib/ToastContext";
import * as haptics from "../lib/haptics";

export default function Challenges() {
  const toast = useToast();
  const [daily, setDaily] = useState(() => todaysChallenge());
  const [weekly, setWeekly] = useState(() => weeklyChallenge());
  const [dailyProg, setDailyProg] = useState(() => getProgress(daily));
  const [weeklyProg, setWeeklyProg] = useState(() => getProgress(weekly));

  useEffect(() => {
    const t = setInterval(() => {
      const nd = todaysChallenge();
      if (nd.id !== daily.id) {
        setDaily(nd);
        setDailyProg(getProgress(nd));
      }
    }, 60_000);
    return () => clearInterval(t);
  }, [daily.id]);

  const tickDaily = () => {
    haptics.tap();
    const next = bumpProgress(daily, 1);
    setDailyProg(next);
    if (next.completed && !dailyProg.completed) {
      haptics.success();
      toast("Challenge complete! Claim your XP.", { kind: "xp" });
    }
  };
  const tickWeekly = () => {
    haptics.tap();
    const next = bumpProgress(weekly, 10);
    setWeeklyProg(next);
    if (next.completed && !weeklyProg.completed) {
      haptics.success();
      toast("Weekly battle conquered!", { kind: "rank" });
    }
  };
  const claimDaily = () => {
    haptics.pop();
    setDailyProg(claim(daily));
    toast(`+${daily.xp} XP claimed`, { kind: "xp" });
  };
  const claimWeekly = () => {
    haptics.pop();
    setWeeklyProg(claim(weekly));
    toast(`+${weekly.xp} XP claimed`, { kind: "xp" });
  };

  return (
    <>
      <TopBar title="Challenges" bell dm />
      <div className="max-w-md mx-auto px-4 pt-3 mb-6 space-y-4">
        {/* XP banner */}
        <div className="rounded-3xl p-4 bg-gradient-to-br from-electric-400/15 via-neon-400/10 to-hot/15 border border-white/8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-gradient-electric grid place-items-center shadow-glow">
              <Zap className="size-6 text-graphite-900" strokeWidth={3} />
            </div>
            <div>
              <div className="font-display font-bold">XP boost active</div>
              <div className="text-xs text-ink-400">
                Crushing challenges gets you to the next tier faster.
              </div>
            </div>
          </div>
        </div>

        {/* Daily */}
        <ChallengeCard
          accent="electric"
          icon={<CalendarDays className="size-5" />}
          tag="Today's challenge"
          challenge={daily}
          progress={dailyProg}
          onTick={tickDaily}
          onClaim={claimDaily}
        />

        {/* Weekly */}
        <ChallengeCard
          accent="hot"
          icon={<Trophy className="size-5" />}
          tag="Weekly battle"
          challenge={weekly}
          progress={weeklyProg}
          onTick={tickWeekly}
          onClaim={claimWeekly}
        />

        {/* Static "future" challenges teaser */}
        <h3 className="text-xs uppercase tracking-wider text-ink-400 pt-2">
          Coming up
        </h3>
        <ul className="space-y-1.5">
          {[
            { title: "Around-the-world Tuesday", sub: "Win 100 XP", icon: <Target className="size-4" /> },
            { title: "No-Drop Wednesday", sub: "Streak the day, +50 XP", icon: <Flame className="size-4" /> },
            { title: "Battle of the Crews", sub: "Tysons vs McLean", icon: <Trophy className="size-4" /> },
          ].map((c) => (
            <li
              key={c.title}
              className="flex items-center gap-3 p-3 rounded-2xl glass opacity-80"
            >
              <div className="size-9 rounded-xl glass-pill grid place-items-center">
                {c.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{c.title}</div>
                <div className="text-xs text-ink-400">{c.sub}</div>
              </div>
              <span className="text-[11px] text-ink-500">Locked</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ChallengeCard({ accent, icon, tag, challenge, progress, onTick, onClaim }) {
  const pct = Math.min(100, (progress.done / challenge.goal) * 100);
  const bar =
    accent === "hot" ? "bg-gradient-hot" : "bg-gradient-electric";
  const glow =
    accent === "hot" ? "shadow-glow-hot" : "shadow-glow";

  return (
    <div className="rounded-3xl glass p-4">
      <div className="flex items-center gap-2 text-xs text-ink-400">
        {icon}
        <span className="uppercase tracking-wider">{tag}</span>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-graphite-700 text-[10.5px] font-semibold text-ink-50">
          +{challenge.xp} XP
        </span>
      </div>
      <h3 className="mt-2 font-display font-bold text-lg leading-tight">
        {challenge.title}
      </h3>
      <p className="text-sm text-ink-50/80 mt-1">{challenge.sub}</p>

      <div className="mt-3">
        <div className="h-2 rounded-full bg-graphite-700 overflow-hidden">
          <div
            className={`h-full ${bar} transition-[width] duration-500 ${glow}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-ink-400">
          <span>
            {progress.done}/{challenge.goal} {challenge.unit}
          </span>
          <span className="tabular-nums">{Math.round(pct)}%</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {!progress.completed ? (
          <button
            onClick={onTick}
            className="flex-1 h-11 rounded-2xl bg-graphite-700 hover:bg-graphite-600 active:scale-[0.99] font-semibold text-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="size-4" /> Log progress
          </button>
        ) : progress.claimed ? (
          <button
            disabled
            className="flex-1 h-11 rounded-2xl bg-graphite-700 text-ink-400 font-semibold text-sm flex items-center justify-center gap-1.5"
          >
            <Check className="size-4" /> Claimed
          </button>
        ) : (
          <button
            onClick={onClaim}
            className={`flex-1 h-11 rounded-2xl ${bar} text-graphite-900 font-bold text-sm ${glow} active:scale-[0.99]`}
          >
            Claim +{challenge.xp} XP
          </button>
        )}
      </div>
    </div>
  );
}
