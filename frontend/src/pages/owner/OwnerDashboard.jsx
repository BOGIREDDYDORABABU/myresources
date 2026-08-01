import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StatusPill from "../../components/StatusPill";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function OwnerDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get("/owner/resources", { params: { size: 50 } })
      .then((res) => setResources(res.data.data.content))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm("Remove this resource? It will no longer be visible to borrowers.")) return;
    await api.delete(`/owner/resources/${id}`);
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My Resources</h1>
          <p className="text-sm text-ink-soft">Manage inventory, pricing, and availability.</p>
        </div>
        <Link to="/owner/resources/new" className="flex items-center gap-1.5 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-600">
          <Plus size={16} /> Add resource
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink-soft">Loading…</div>
      ) : resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-ink-soft">
          You haven&rsquo;t listed anything yet. Add your first resource to start sharing.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-forest-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.resourceType.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.quantityAvailable} / {r.quantityTotal}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/owner/resources/${r.id}/edit`} className="rounded-full p-2 text-ink-soft hover:bg-forest-50" title="Edit">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => handleDelete(r.id)} className="rounded-full p-2 text-clay hover:bg-clay/10" title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
