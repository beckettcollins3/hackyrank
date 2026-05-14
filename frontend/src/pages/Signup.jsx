import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

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
      setMsg("Check your email to confirm your account, then log in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-zinc-900/60 border border-gray-800 rounded-xl p-6 flex flex-col gap-3"
      >
        <h1 className="text-xl font-bold mb-1">Create your HackyRank account</h1>

        <input
          type="text"
          placeholder="Username"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-gray-700 focus:outline-none focus:border-red-500"
        />
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
          placeholder="Password (min 6 chars)"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-zinc-800 border border-gray-700 focus:outline-none focus:border-red-500"
        />

        {err && <p className="text-red-400 text-sm">{err}</p>}
        {msg && <p className="text-green-400 text-sm">{msg}</p>}

        <button
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded"
        >
          {loading ? "Creating…" : "Sign up"}
        </button>

        <p className="text-sm text-gray-400 mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-red-400 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
