import { useEffect, useState } from "react";
import api from "../../api/axios";
import ResourceCard from "../../components/ResourceCard";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/wishlist", { params: { size: 50 } })
      .then((res) => setItems(res.data.data.content))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Wishlist</h1>
      {loading ? (
        <div className="py-16 text-center text-ink-soft">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-ink-soft">
          Nothing saved yet. Browse resources and tap the heart to save them here.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((w) => (
            <ResourceCard key={w.id} resource={w.resource} />
          ))}
        </div>
      )}
    </div>
  );
}
