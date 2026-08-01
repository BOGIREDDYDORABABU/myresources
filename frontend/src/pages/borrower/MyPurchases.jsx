import { useEffect, useState } from "react";
import api from "../../api/axios";
import StatusPill from "../../components/StatusPill";

export default function MyPurchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/purchase/orders/mine", { params: { size: 50 } })
      .then((res) => setOrders(res.data.data.content))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">My Purchases</h1>
      {loading ? (
        <div className="py-16 text-center text-ink-soft">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-ink-soft">
          You haven&rsquo;t bought anything yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-2xl border border-border bg-white/60 p-4">
              <div>
                <p className="font-display font-semibold text-ink">{o.resource.name}</p>
                <p className="text-xs text-ink-soft">Qty {o.quantity} • ₹{o.totalAmount}</p>
              </div>
              <StatusPill status={o.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
