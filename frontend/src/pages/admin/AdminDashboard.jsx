import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import api from "../../api/axios";

const linkClass = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium ${isActive ? "bg-forest-700 text-paper" : "bg-white/60 text-ink-soft hover:bg-forest-50"}`;

const STAT_LABELS = {
  totalUsers: "Users",
  totalOwners: "Owners",
  totalBorrowers: "Borrowers",
  totalResources: "Resources",
  totalBorrowRequests: "Borrow requests",
  totalPurchaseOrders: "Purchase orders",
  openComplaints: "Open complaints",
  totalTransactions: "Transactions",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setStats(res.data.data));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Admin Console</h1>

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(STAT_LABELS).map(([key, label]) => (
            <div key={key} className="rounded-2xl border border-border bg-white/60 p-4">
              <p className="text-xs uppercase tracking-wide text-ink-soft">{label}</p>
              <p className="font-display text-2xl font-semibold text-forest-700">{stats[key] ?? "—"}</p>
            </div>
          ))}
        </div>
      )}

      <nav className="mb-6 flex gap-2">
        <NavLink to="/admin/users" className={linkClass}>Users</NavLink>
        <NavLink to="/admin/complaints" className={linkClass}>Complaints</NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
