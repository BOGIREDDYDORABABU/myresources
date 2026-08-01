import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusPill from "../../components/StatusPill";

export default function OwnerRequests() {
  const [tab, setTab] = useState("borrow");
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    Promise.all([
      api.get("/borrow/requests/incoming", { params: { size: 50 } }),
      api.get("/purchase/orders/incoming", { params: { size: 50 } }),
    ])
      .then(([b, p]) => {
        setBorrowRequests(b.data.data.content);
        setOrders(p.data.data.content);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function act(fn, id) {
    setBusyId(id);
    try {
      await fn();
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Requests &amp; Orders</h1>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab("borrow")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${tab === "borrow" ? "bg-forest-700 text-paper" : "bg-white/60 text-ink-soft"}`}>
          Borrow requests ({borrowRequests.length})
        </button>
        <button onClick={() => setTab("purchase")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${tab === "purchase" ? "bg-forest-700 text-paper" : "bg-white/60 text-ink-soft"}`}>
          Purchase orders ({orders.length})
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink-soft">Loading…</div>
      ) : tab === "borrow" ? (
        borrowRequests.length === 0 ? (
          <Empty text="No borrow requests yet." />
        ) : (
          <div className="flex flex-col gap-3">
            {borrowRequests.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-white/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold text-ink">{r.resource.name}</p>
                    <p className="text-xs text-ink-soft">
                      {r.borrower.name} • {r.startDate} → {r.expectedReturnDate} • Qty {r.quantity}
                    </p>
                  </div>
                  <StatusPill status={r.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status === "PENDING" && (
                    <>
                      <button disabled={busyId === r.id}
                        onClick={() => act(() => api.post(`/borrow/requests/${r.id}/approve`), r.id)}
                        className="rounded-full bg-forest-700 px-3 py-1.5 text-xs font-semibold text-paper hover:bg-forest-600">
                        Approve
                      </button>
                      <button disabled={busyId === r.id}
                        onClick={() => act(() => api.post(`/borrow/requests/${r.id}/reject`, { reason: prompt("Reason for rejection?") || "" }), r.id)}
                        className="rounded-full border border-clay px-3 py-1.5 text-xs font-semibold text-clay hover:bg-clay/10">
                        Reject
                      </button>
                    </>
                  )}
                  {r.status === "OTP_VERIFIED" && (
                    <button disabled={busyId === r.id}
                      onClick={() => act(() => api.post(`/borrow/requests/${r.id}/confirm-pickup`), r.id)}
                      className="rounded-full bg-sky px-3 py-1.5 text-xs font-semibold text-paper hover:opacity-90">
                      Confirm pickup
                    </button>
                  )}
                  {(r.status === "ACTIVE" || r.status === "RETURN_REQUESTED") && (
                    <button disabled={busyId === r.id}
                      onClick={() => act(() => api.post(`/borrow/requests/${r.id}/confirm-return`), r.id)}
                      className="rounded-full bg-forest-700 px-3 py-1.5 text-xs font-semibold text-paper hover:bg-forest-600">
                      Confirm return
                    </button>
                  )}
                  {r.status === "APPROVED" && (
                    <p className="text-xs text-ink-soft">Waiting for borrower to verify OTP {r.otpCode ? `(${r.otpCode})` : ""}.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : orders.length === 0 ? (
        <Empty text="No purchase orders yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-white/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display font-semibold text-ink">{o.resource.name}</p>
                  <p className="text-xs text-ink-soft">{o.buyer.name} • Qty {o.quantity} • ₹{o.totalAmount}</p>
                </div>
                <StatusPill status={o.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.status === "PAID" && (
                  <button disabled={busyId === o.id}
                    onClick={() => act(() => api.post(`/purchase/orders/${o.id}/approve`), o.id)}
                    className="rounded-full bg-forest-700 px-3 py-1.5 text-xs font-semibold text-paper hover:bg-forest-600">
                    Approve order
                  </button>
                )}
                {(o.status === "APPROVED" || o.status === "OUT_FOR_DELIVERY") && (
                  <button disabled={busyId === o.id}
                    onClick={() => act(() => api.post(`/purchase/orders/${o.id}/complete`), o.id)}
                    className="rounded-full bg-sky px-3 py-1.5 text-xs font-semibold text-paper hover:opacity-90">
                    Mark delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }) {
  return <div className="rounded-2xl border border-dashed border-border py-16 text-center text-ink-soft">{text}</div>;
}
