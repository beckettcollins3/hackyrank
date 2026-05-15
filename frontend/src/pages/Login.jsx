import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import AuthShell from "../components/AuthShell";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Log in to drop new clips and climb the leaderboard."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="text-electric-400 font-semibold">
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-graphite-800/70 border border-white/8 placeholder:text-ink-500 focus:outline-none focus:border-electric-400/60"
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-graphite-800/70 border border-white/8 placeholder:text-ink-500 focus:outline-none focus:border-electric-400/60"
        />
        {err && <p className="text-hot text-sm">{err}</p>}
        <button
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-gradient-electric text-graphite-900 font-bold shadow-glow disabled:opacity-60 active:scale-[0.99] transition"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}
