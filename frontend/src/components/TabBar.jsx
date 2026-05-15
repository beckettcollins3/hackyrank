import { NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, Trophy, User, Plus } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

function Tab({ to, end, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition ${
          isActive
            ? "text-electric-400"
            : "text-ink-400 hover:text-ink-50 active:scale-95"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`size-6 transition ${isActive ? "drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]" : ""}`}
            strokeWidth={isActive ? 2.5 : 2}
          />
          <span className="text-[10px] font-medium tracking-wide">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function TabBar() {
  const { session } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-md px-3 pb-[max(env(safe-area-inset-bottom),8px)] pointer-events-auto">
        <div className="glass-strong rounded-2xl flex items-stretch h-16 relative overflow-hidden">
          <Tab to="/" end label="Home" icon={Home} />
          <Tab to="/explore" label="Explore" icon={Compass} />

          {/* Center FAB */}
          <button
            onClick={() => navigate(session ? "/upload" : "/login")}
            className="relative -mt-5 mx-1 size-14 rounded-2xl bg-gradient-electric grid place-items-center shadow-glow active:scale-95 transition"
            aria-label="Upload"
          >
            <Plus className="size-7 text-graphite-900" strokeWidth={3} />
          </button>

          <Tab to="/leaderboard" label="Ranks" icon={Trophy} />
          <Tab to="/profile" label="Me" icon={User} />
        </div>
      </div>
    </nav>
  );
}
