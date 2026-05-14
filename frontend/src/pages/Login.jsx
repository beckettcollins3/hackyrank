import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

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
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-zinc-900/60 border border-gray-800 rounded-xl p-6 flex flex-col gap-3"
      >
        <h1 className="text-xl font-bold mb-1">Log in to HackyRank</h1>

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-gray-700 focus:outline-none focus:border-red-500"
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-gray-700 focus:outline-none focus:border-red-500"
        />

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <button
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p className="text-sm text-gray-400 mt-2">
          No account?{" "}
          <Link to="/signup" className="text-red-400 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
