import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sprout } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(identifier, password);
      const from = location.state?.from;
      const dest = from || (user.role === "ADMIN" ? "/admin" : user.role === "OWNER" ? "/owner" : "/");
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not log in. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 text-paper">
          <Sprout size={22} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-forest-900">Welcome back</h1>
        <p className="text-sm text-ink-soft">Log in to borrow, buy, or manage your resources.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-white/60 p-6">
        {error && (
          <div className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{error}</div>
        )}
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Email or phone number
          <input
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500"
            placeholder="you@example.com or 9876543210"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500"
            placeholder="••••••••"
          />
        </label>
        <Link to="/forgot-password" className="-mt-2 self-end text-xs font-semibold text-forest-700 hover:underline">
          Forgot password?
        </Link>
        <button
          disabled={busy}
          className="mt-2 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-600 disabled:opacity-60"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New here?{" "}
        <Link to="/register" className="font-semibold text-forest-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
