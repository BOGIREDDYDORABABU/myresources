import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { ShieldCheck } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState(location.state?.identifier || "");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/auth/reset-password", {
        identifier: identifier.trim(),
        otpCode: otpCode.trim(),
        newPassword,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset your password. Check your code and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 text-paper">
          <ShieldCheck size={22} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-forest-900">Password updated</h1>
        <p className="mt-2 text-sm text-ink-soft">You can now log in with your new password.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-600"
        >
          Go to log in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 text-paper">
          <ShieldCheck size={22} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-forest-900">Reset your password</h1>
        <p className="text-sm text-ink-soft">Enter the code we emailed you, and choose a new password.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-white/60 p-6">
        {error && <div className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{error}</div>}
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Email or phone number
          <input required value={identifier} onChange={(e) => setIdentifier(e.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          6-digit reset code
          <input required value={otpCode} onChange={(e) => setOtpCode(e.target.value)} maxLength={6}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm tracking-widest outline-none focus:border-forest-500" placeholder="123456" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          New password
          <input required type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500" placeholder="••••••••" />
        </label>
        <button disabled={busy} className="mt-2 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-600 disabled:opacity-60">
          {busy ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link to="/forgot-password" className="font-semibold text-forest-700 hover:underline">
          Didn't get a code? Request another
        </Link>
      </p>
    </div>
  );
}
