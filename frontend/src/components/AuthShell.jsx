import { Flame } from "lucide-react";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[100dvh] relative overflow-hidden flex flex-col">
      {/* Background ambience */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 size-[28rem] rounded-full bg-electric/25 blur-3xl" />
        <div className="absolute top-40 -right-24 size-[26rem] rounded-full bg-hot/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[30rem] rounded-full bg-neon/15 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-[max(env(safe-area-inset-top),24px)]">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-2xl bg-gradient-electric grid place-items-center shadow-glow">
            <Flame className="size-5 text-graphite-900" strokeWidth={3} />
          </div>
          <div>
            <div className="text-lg font-display font-black tracking-tight">
              HackyRank
            </div>
            <div className="text-[10px] tracking-[0.2em] text-ink-400 uppercase">
              Footbag · Ranked · Real
            </div>
          </div>
        </div>

        <div className="mt-12 mb-6">
          <h1 className="text-3xl font-display font-black tracking-tight leading-tight text-balance">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-ink-400 text-pretty max-w-sm">{subtitle}</p>
          )}
        </div>

        <div className="max-w-sm w-full">{children}</div>

        <div className="mt-6 text-sm text-ink-400">{footer}</div>

        <div className="mt-auto pb-[max(env(safe-area-inset-bottom),24px)] pt-10">
          <p className="text-[11px] text-ink-500">
            By continuing you agree to our Terms & Privacy. RLS-secured. Ad-free.
          </p>
        </div>
      </div>
    </div>
  );
}
