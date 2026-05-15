import { MessageCircle, Sparkles } from "lucide-react";
import TopBar from "../components/TopBar";

export default function Messages() {
  return (
    <>
      <TopBar title="Messages" back />
      <div className="max-w-md mx-auto px-4 pt-2">
        <div className="mt-6 rounded-3xl glass p-6 text-center">
          <div className="mx-auto size-16 rounded-2xl bg-gradient-electric grid place-items-center shadow-glow mb-3">
            <MessageCircle className="size-7 text-graphite-900" strokeWidth={2.5} />
          </div>
          <h2 className="font-display font-bold text-lg">DMs are coming</h2>
          <p className="text-ink-400 text-sm mt-1.5 text-pretty">
            We're cooking up direct messages so you can hype up freestylers and
            challenge rivals. Stay tuned.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs">
            <Sparkles className="size-3.5 text-neon-400" />
            Shipping soon
          </div>
        </div>

        {/* Placeholder thread previews */}
        <h3 className="mt-6 mb-2 text-xs uppercase tracking-wider text-ink-400">
          Preview
        </h3>
        <ul className="space-y-1.5 opacity-50 pointer-events-none">
          {["@kicker", "@stallqueen", "@toesnatcher"].map((u) => (
            <li
              key={u}
              className="flex items-center gap-3 p-3 rounded-2xl glass"
            >
              <div className="size-10 rounded-full bg-graphite-700" />
              <div className="flex-1">
                <div className="font-semibold text-sm">{u}</div>
                <div className="text-xs text-ink-400 truncate">
                  yo that flow was crazy 🔥
                </div>
              </div>
              <span className="text-[11px] text-ink-500">2m</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
