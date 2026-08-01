import { useEffect, useState } from "react";
import api from "../api/axios";
import ResourceCard from "../components/ResourceCard";
import { Search, SlidersHorizontal } from "lucide-react";

const CATEGORIES = [
  "BOOKS", "ELECTRONICS", "SPORTS", "FURNITURE", "VEHICLES",
  "MEDICAL_EQUIPMENT", "TOOLS", "LAB_EQUIPMENT", "MUSICAL_INSTRUMENTS", "OTHERS",
];

export default function Home() {
  const [resources, setResources] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [borrow, setBorrow] = useState(false);
  const [sell, setSell] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 12, sort };
    if (q) params.q = q;
    if (category) params.category = category;
    if (borrow) params.borrow = true;
    if (sell) params.sell = true;
    if (discountOnly) params.discountOnly = true;

    api
      .get("/resources", { params })
      .then((res) => {
        setResources(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, q, category, borrow, sell, discountOnly, sort]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(0);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-10 rounded-3xl bg-forest-700 px-8 py-12 text-paper">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-forest-100">
          Community lending &amp; marketplace
        </p>
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Borrow what you need,<br />sell what you don&rsquo;t use.
        </h1>
        <form onSubmit={handleSearchSubmit} className="mt-6 flex max-w-xl gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-paper px-4 py-2.5">
            <Search size={18} className="text-ink-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools, books, electronics…"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
            />
          </div>
          <button className="rounded-full bg-ochre-500 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ochre-400">
            Search
          </button>
        </form>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => { setCategory(""); setPage(0); }}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            category === "" ? "bg-forest-700 text-paper" : "bg-white/60 text-ink-soft hover:bg-forest-50"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => { setCategory(c); setPage(0); }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              category === c ? "bg-forest-700 text-paper" : "bg-white/60 text-ink-soft hover:bg-forest-50"
            }`}
          >
            {c.replaceAll("_", " ")}
          </button>
        ))}

        <button
          onClick={() => setShowFilters((s) => !s)}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-forest-50"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white/60 p-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={borrow} onChange={(e) => { setBorrow(e.target.checked); setPage(0); }} />
            Borrow only
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={sell} onChange={(e) => { setSell(e.target.checked); setPage(0); }} />
            For sale
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={discountOnly} onChange={(e) => { setDiscountOnly(e.target.checked); setPage(0); }} />
            Discounted
          </label>
          <label className="ml-auto flex items-center gap-2 text-sm text-ink">
            Sort by
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}
              className="rounded-lg border border-border bg-paper px-2 py-1.5 text-sm">
              <option value="newest">Newest</option>
              <option value="priceLowHigh">Price: low to high</option>
              <option value="priceHighLow">Price: high to low</option>
              <option value="highestRated">Highest rated</option>
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-ink-soft">Loading resources…</div>
      ) : resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center text-ink-soft">
          Nothing matches yet. Try a different search or check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`h-8 w-8 rounded-full text-sm font-medium ${
                i === page ? "bg-forest-700 text-paper" : "bg-white/60 text-ink-soft hover:bg-forest-50"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
