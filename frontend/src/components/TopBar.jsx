import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Bell, MessageCircle } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

export default function TopBar({
  title,
  back = false,
  right = null,
  bell = false,
  dm = false,
  transparent = false,
}) {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <header
      className={`sticky top-0 z-30 safe-pt ${
        transparent ? "" : "glass-strong border-b border-white/5"
      }`}
    >
      <div className="max-w-md mx-auto px-3 h-12 flex items-center gap-2">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="size-9 grid place-items-center -ml-1 rounded-full hover:bg-white/5 active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}
        <h1 className="font-display font-semibold tracking-tight text-base">
          {title}
        </h1>
        <div className="ml-auto flex items-center gap-1">
          {dm && session && (
            <Link
              to="/messages"
              className="size-9 grid place-items-center rounded-full hover:bg-white/5 active:scale-95"
              aria-label="Messages"
            >
              <MessageCircle className="size-5" />
            </Link>
          )}
          {bell && session && (
            <Link
              to="/notifications"
              className="relative size-9 grid place-items-center rounded-full hover:bg-white/5 active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-hot" />
            </Link>
          )}
          {right}
        </div>
      </div>
    </header>
  );
}
