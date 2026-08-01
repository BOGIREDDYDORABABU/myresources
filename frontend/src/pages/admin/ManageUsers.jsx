import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    api.get("/admin/users", { params: { size: 100, ...(role ? { role } : {}) } })
      .then((res) => setUsers(res.data.data.content))
      .finally(() => setLoading(false));
  }

  useEffect(load, [role]);

  async function toggleBlock(u) {
    setBusyId(u.id);
    try {
      await api.post(`/admin/users/${u.id}/${u.blocked ? "unblock" : "block"}`);
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function verify(u) {
    setBusyId(u.id);
    try {
      await api.post(`/admin/users/${u.id}/verify`);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {["", "OWNER", "BORROWER", "ADMIN"].map((r) => (
          <button key={r} onClick={() => setRole(r)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${role === r ? "bg-forest-700 text-paper" : "bg-white/60 text-ink-soft"}`}>
            {r || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink-soft">Loading…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-forest-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.email || u.phone}</td>
                  <td className="px-4 py-3 text-ink-soft">{u.role}</td>
                  <td className="px-4 py-3">
                    {u.blocked ? (
                      <span className="rounded-full bg-clay/10 px-2 py-1 text-xs font-semibold text-clay">Blocked</span>
                    ) : u.identityVerified ? (
                      <span className="rounded-full bg-forest-50 px-2 py-1 text-xs font-semibold text-forest-700">Verified</span>
                    ) : (
                      <span className="rounded-full bg-ochre-100 px-2 py-1 text-xs font-semibold text-ochre-600">Unverified</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {!u.identityVerified && u.role !== "ADMIN" && (
                        <button disabled={busyId === u.id} onClick={() => verify(u)}
                          className="rounded-full border border-forest-600 px-3 py-1 text-xs font-semibold text-forest-700 hover:bg-forest-50">
                          Verify
                        </button>
                      )}
                      {u.role !== "ADMIN" && (
                        <button disabled={busyId === u.id} onClick={() => toggleBlock(u)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${u.blocked ? "border border-forest-600 text-forest-700 hover:bg-forest-50" : "border border-clay text-clay hover:bg-clay/10"}`}>
                          {u.blocked ? "Unblock" : "Block"}
                        </button>
                      )}
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
