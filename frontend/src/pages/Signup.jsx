import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import AuthShell from "../components/AuthShell";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) {
      setErr("Username must be 3–20 chars (letters, digits, underscore).");
      return;
    }
    setLoading(true);
    const { data, error } = await signUp(email, password, username.toLowerCase());
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (data.session) {
      navigate("/", { replace: true });
    } else {
      setMsg("Check your inbox to confirm, then log in.");
    }
  };

  return (
    <AuthShell
      title={
        <>
          Make your name on the
          <br />
          <span className="bg-gradient-to-r from-electric-400 via-neon-400 to-hot bg-clip-text text-transparent">
            HackyRank board.
          </span>
        </>
      }
      subtitle="Sign up to upload clips, get ranked, and earn tier badges."
      footer={
        <>
          Already got an account?{" "}
          <Link to="/login" className="text-electric-400 font-semibold">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500">
            @
          </span>
          <input
            type="text"
            placeholder="username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-12 pl-8 pr-4 rounded-2xl bg-graphite-800/70 border border-white/8 placeholder:text-ink-500 focus:outline-none focus:border-electric-400/60"
          />
        </div>
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
          placeholder="Password (min 6 chars)"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 rounded-2xl bg-graphite-800/70 border border-white/8 placeholder:text-ink-500 focus:outline-none focus:border-electric-400/60"
        />
        {err && <p className="text-hot text-sm">{err}</p>}
        {msg && <p className="text-neon-400 text-sm">{msg}</p>}
        <button
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-gradient-electric text-graphite-900 font-bold shadow-glow disabled:opacity-60 active:scale-[0.99] transition"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
