import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const TYPES = ["FAKE_RESOURCE", "DAMAGED_RESOURCE", "FRAUD", "LATE_RETURN", "PAYMENT_ISSUE", "ABUSE"];

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const [type, setType] = useState(TYPES[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/complaints", { type, description });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your complaint.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Complaint submitted</h1>
        <p className="mt-2 text-sm text-ink-soft">Our admin team will review it shortly.</p>
        <button onClick={() => navigate("/me")} className="mt-6 rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-paper hover:bg-forest-600">
          Back to account
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">File a complaint</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-white/60 p-6">
        {error && <div className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{error}</div>}
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Type
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-border bg-paper px-3 py-2 text-sm">
            {TYPES.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Description
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
        </label>
        <button disabled={busy} className="rounded-full bg-clay px-4 py-2.5 text-sm font-semibold text-paper hover:opacity-90 disabled:opacity-60">
          {busy ? "Submitting…" : "Submit complaint"}
        </button>
      </form>
    </div>
  );
}
