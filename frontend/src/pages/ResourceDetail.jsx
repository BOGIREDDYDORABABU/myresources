import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StatusPill from "../components/StatusPill";
import { Heart, MapPin, ShieldCheck, Star, ArrowLeft } from "lucide-react";

export default function ResourceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  function load() {
    api.get(`/resources/${id}`).then((res) => setResource(res.data.data));
  }

  useEffect(() => {
    load();
  }, [id]);

  if (!resource) {
    return <div className="py-24 text-center text-ink-soft">Loading…</div>;
  }

  const canBorrow =
    (resource.resourceType === "BORROW_ONLY" || resource.resourceType === "BORROW_AND_SELL") &&
    resource.status === "AVAILABLE";
  const canBuy =
    (resource.resourceType === "SELL_ONLY" || resource.resourceType === "BORROW_AND_SELL") &&
    resource.status === "AVAILABLE";

  async function requireAuth() {
    if (!user) {
      navigate("/login", { state: { from: `/resources/${id}` } });
      return false;
    }
    return true;
  }

  async function handleWishlist() {
    if (!(await requireAuth())) return;
    setError("");
    try {
      await api.post(`/wishlist/${id}`);
      setMessage("Added to wishlist.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add to wishlist.");
    }
  }

  async function handleBorrow(e) {
    e.preventDefault();
    if (!(await requireAuth())) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/borrow/requests", {
        resourceId: Number(id),
        startDate,
        expectedReturnDate: returnDate,
        quantity: Number(quantity),
      });
      setMessage("Borrow request sent! Track it from My Borrows.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send borrow request.");
    } finally {
      setBusy(false);
    }
  }

  async function handleBuy() {
    if (!(await requireAuth())) return;
    setBusy(true);
    setError("");
    try {
      const res = await api.post("/purchase/orders", { resourceId: Number(id), quantity: Number(quantity) });
      const orderId = res.data.data.id;
      await api.post(`/purchase/orders/${orderId}/pay`);
      setMessage("Purchase complete! Track it from My Purchases.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not complete purchase.");
    } finally {
      setBusy(false);
    }
  }

  const images = resource.imageUrls?.length ? resource.imageUrls : [null];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-border bg-forest-50">
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={resource.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-7xl">📦</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border ${activeImg === i ? "border-forest-600" : "border-border"}`}>
                  {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusPill status={resource.status} />
            {resource.verified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-forest-700">
                <ShieldCheck size={14} /> Verified
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink">{resource.name}</h1>
          <p className="mt-1 text-sm uppercase tracking-wide text-ink-soft">{resource.category?.replaceAll("_", " ")}</p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
            {resource.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {resource.location}
              </span>
            )}
            {resource.averageRating > 0 && (
              <span className="flex items-center gap-1 text-ochre-600">
                <Star size={14} fill="currentColor" /> {resource.averageRating.toFixed(1)}
              </span>
            )}
            <span>Owner: {resource.ownerName}</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink">{resource.description || "No description provided."}</p>

          <div className="mt-4 flex flex-wrap gap-4">
            {resource.sellingPrice && (
              <div>
                <p className="text-xs uppercase text-ink-soft">Selling price</p>
                <p className="font-display text-xl font-semibold text-forest-700">₹{resource.sellingPrice}</p>
              </div>
            )}
            {resource.borrowPricePerDay && (
              <div>
                <p className="text-xs uppercase text-ink-soft">Borrow price</p>
                <p className="font-display text-xl font-semibold text-forest-700">₹{resource.borrowPricePerDay}/day</p>
              </div>
            )}
            {resource.securityDeposit && (
              <div>
                <p className="text-xs uppercase text-ink-soft">Security deposit</p>
                <p className="font-display text-xl font-semibold text-ink">₹{resource.securityDeposit}</p>
              </div>
            )}
          </div>

          <p className="mt-2 text-xs text-ink-soft">{resource.quantityAvailable} of {resource.quantityTotal} available</p>

          {message && <div className="mt-4 rounded-lg bg-forest-50 px-3 py-2 text-sm text-forest-700">{message}</div>}
          {error && <div className="mt-4 rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{error}</div>}

          <div className="mt-6 flex flex-col gap-4">
            {canBorrow && (
              <form onSubmit={handleBorrow} className="rounded-2xl border border-border bg-white/60 p-4">
                <p className="mb-3 font-display text-sm font-semibold text-ink">Borrow this</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
                    Start date
                    <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-lg border border-border bg-paper px-2 py-1.5 text-sm" />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
                    Return by
                    <input required type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                      className="rounded-lg border border-border bg-paper px-2 py-1.5 text-sm" />
                  </label>
                </div>
                <button disabled={busy} className="mt-3 w-full rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-paper hover:bg-forest-600 disabled:opacity-60">
                  Send borrow request
                </button>
              </form>
            )}

            {canBuy && (
              <div className="rounded-2xl border border-border bg-white/60 p-4">
                <p className="mb-3 font-display text-sm font-semibold text-ink">Buy this</p>
                <label className="flex items-center gap-2 text-xs font-medium text-ink-soft">
                  Quantity
                  <input type="number" min={1} max={resource.quantityAvailable} value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-20 rounded-lg border border-border bg-paper px-2 py-1.5 text-sm" />
                </label>
                <button onClick={handleBuy} disabled={busy} className="mt-3 w-full rounded-full bg-ochre-500 px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre-400 disabled:opacity-60">
                  Buy now
                </button>
              </div>
            )}

            <button onClick={handleWishlist} className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-forest-50">
              <Heart size={16} /> Save to wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
