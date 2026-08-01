import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { KeyRound } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { identifier });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 text-paper">
          <KeyRound size={22} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-forest-900">Check your email</h1>
        <p className="mt-2 text-sm text-ink-soft">
          If an account exists for <span className="font-medium text-ink">{identifier}</span>, we've sent a 6-digit
          reset code. It expires in 15 minutes.
        </p>
        <button
          onClick={() => navigate("/reset-password", { state: { identifier } })}
          className="mt-6 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-600"
        >
          I have my code
        </button>
        <Link to="/login" className="mt-4 text-sm font-semibold text-forest-700 hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 text-paper">
          <KeyRound size={22} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-forest-900">Forgot your password?</h1>
        <p className="text-sm text-ink-soft">Enter your email or phone and we'll send you a reset code.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-white/60 p-6">
        {error && <div className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{error}</div>}
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
        <button
          disabled={busy}
          className="mt-2 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-600 disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send reset code"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Remembered it?{" "}
        <Link to="/login" className="font-semibold text-forest-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
