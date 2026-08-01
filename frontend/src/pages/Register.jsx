import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sprout } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", location: "", role: "BORROWER",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email && !form.phone) {
      setError("Please provide an email address or a phone number.");
      return;
    }
    setBusy(true);
    try {
      const user = await register(form);
      navigate(user.role === "OWNER" ? "/owner" : "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your account. Please try again.");
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
        <h1 className="font-display text-2xl font-semibold text-forest-900">Join My Resources</h1>
        <p className="text-sm text-ink-soft">Share what you own, or borrow what you need.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-white/60 p-6">
        {error && <div className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{error}</div>}

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Full name
          <input required value={form.name} onChange={(e) => update("name", e.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Email
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Phone
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500" />
          </label>
        </div>
        <p className="-mt-2 text-xs text-ink-soft">Provide at least one of email or phone.</p>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Password
          <input required type="password" minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500" />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Location
          <input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, area"
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500" />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-ink">I want to</legend>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "BORROWER", label: "Borrow & buy" },
              { value: "OWNER", label: "Share & sell" },
            ].map((opt) => (
              <button type="button" key={opt.value} onClick={() => update("role", opt.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  form.role === opt.value ? "border-forest-600 bg-forest-50 text-forest-700" : "border-border text-ink-soft hover:bg-forest-50"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <button disabled={busy} className="mt-2 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-600 disabled:opacity-60">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-forest-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
