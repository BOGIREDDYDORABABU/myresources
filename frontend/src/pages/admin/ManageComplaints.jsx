import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusPill from "../../components/StatusPill";

const STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"];

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    api.get("/admin/complaints", { params: { size: 100 } })
      .then((res) => setComplaints(res.data.data.content))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function updateStatus(id, status) {
    setBusyId(id);
    try {
      await api.patch(`/admin/complaints/${id}`, null, { params: { status } });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {loading ? (
        <div className="py-16 text-center text-ink-soft">Loading…</div>
      ) : complaints.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-ink-soft">
          No complaints filed.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {complaints.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-white/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display font-semibold text-ink">{c.type.replaceAll("_", " ")}</p>
                  <p className="text-xs text-ink-soft">By {c.raisedBy?.name}</p>
                </div>
                <StatusPill status={c.status} />
              </div>
              <p className="mt-2 text-sm text-ink">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUSES.filter((s) => s !== c.status).map((s) => (
                  <button key={s} disabled={busyId === c.id} onClick={() => updateStatus(c.id, s)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-ink-soft hover:bg-forest-50">
                    Mark {s.replaceAll("_", " ").toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
