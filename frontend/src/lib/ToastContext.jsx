import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Heart, UserPlus, MessageCircle, Trophy, Zap, CheckCircle2, AlertCircle } from "lucide-react";

const ToastContext = createContext({
  toast: (_msg, _opts) => {},
});

let nextId = 1;
const ICONS = {
  like: <Heart className="size-4 fill-hot text-hot" />,
  follow: <UserPlus className="size-4 text-neon-400" />,
  comment: <MessageCircle className="size-4 text-electric-400" />,
  rank: <Trophy className="size-4 text-yellow-300" />,
  xp: <Zap className="size-4 text-electric-400" />,
  success: <CheckCircle2 className="size-4 text-neon-400" />,
  error: <AlertCircle className="size-4 text-hot" />,
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef({});

  const toast = useCallback((message, opts = {}) => {
    const id = nextId++;
    const kind = opts.kind ?? "success";
    const ttl = opts.ttl ?? 2200;
    setItems((prev) => [...prev, { id, message, kind }]);
    timers.current[id] = setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, ttl);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-[max(env(safe-area-inset-top),14px)] inset-x-0 z-[90] flex flex-col items-center gap-2 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto glass-strong rounded-full pl-3 pr-4 h-10 flex items-center gap-2 shadow-card animate-fade-up"
          >
            {ICONS[t.kind] ?? ICONS.success}
            <span className="text-sm font-medium">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext).toast;
}
