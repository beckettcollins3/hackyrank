import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import InitErrorBanner from "./InitErrorBanner";

export default function Layout() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded text-sm ${
      isActive ? "bg-white/10 text-white" : "text-gray-300 hover:text-white"
    }`;

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <InitErrorBanner />
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-3 py-2 flex items-center gap-2">
          <NavLink to="/" className="font-bold tracking-tight mr-2">
            HackyRank
          </NavLink>

          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Feed
            </NavLink>
            <NavLink to="/leaderboard" className={navClass}>
              Leaderboard
            </NavLink>
            {session && (
              <>
                <NavLink to="/upload" className={navClass}>
                  Upload
                </NavLink>
                <NavLink to="/profile" className={navClass}>
                  Profile
                </NavLink>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 text-sm">
            {session ? (
              <>
                <span className="text-gray-400 hidden sm:inline">
                  @{profile?.username ?? "…"}
                </span>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate("/login");
                  }}
                  className="px-3 py-1 rounded border border-gray-700 hover:bg-white/5"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="px-3 py-1 rounded border border-gray-700 hover:bg-white/5">
                  Log in
                </NavLink>
                <NavLink to="/signup" className="px-3 py-1 rounded bg-red-500 hover:bg-red-600">
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
