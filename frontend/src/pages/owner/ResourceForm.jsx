import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const CATEGORIES = [
  "BOOKS", "ELECTRONICS", "SPORTS", "FURNITURE", "VEHICLES",
  "MEDICAL_EQUIPMENT", "TOOLS", "LAB_EQUIPMENT", "MUSICAL_INSTRUMENTS", "OTHERS",
];
const TYPES = [
  { value: "BORROW_ONLY", label: "Borrow only" },
  { value: "SELL_ONLY", label: "Sell only" },
  { value: "BORROW_AND_SELL", label: "Borrow & sell" },
];

const empty = {
  name: "", category: "BOOKS", description: "", imageUrls: [],
  quantityAvailable: 1, condition: "Good", location: "",
  borrowPricePerDay: "", sellingPrice: "", discountPercent: "",
  resourceType: "BORROW_ONLY", usageRules: "", maxBorrowDurationDays: "",
  securityDeposit: "", lateFeePerDay: "",
};

export default function ResourceForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editing) {
      api.get(`/resources/${id}`).then((res) => {
        const r = res.data.data;
        setForm({
          ...empty,
          ...r,
          borrowPricePerDay: r.borrowPricePerDay ?? "",
          sellingPrice: r.sellingPrice ?? "",
          discountPercent: r.discountPercent ?? "",
          maxBorrowDurationDays: r.maxBorrowDurationDays ?? "",
          securityDeposit: r.securityDeposit ?? "",
          lateFeePerDay: r.lateFeePerDay ?? "",
          imageUrls: r.imageUrls || [],
        });
      });
    }
  }, [id, editing]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addImage() {
    if (!imageUrlInput.trim()) return;
    update("imageUrls", [...form.imageUrls, imageUrlInput.trim()]);
    setImageUrlInput("");
  }

  function removeImage(i) {
    update("imageUrls", form.imageUrls.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const payload = {
      ...form,
      quantityAvailable: Number(form.quantityAvailable),
      borrowPricePerDay: form.borrowPricePerDay === "" ? null : Number(form.borrowPricePerDay),
      sellingPrice: form.sellingPrice === "" ? null : Number(form.sellingPrice),
      discountPercent: form.discountPercent === "" ? 0 : Number(form.discountPercent),
      maxBorrowDurationDays: form.maxBorrowDurationDays === "" ? null : Number(form.maxBorrowDurationDays),
      securityDeposit: form.securityDeposit === "" ? null : Number(form.securityDeposit),
      lateFeePerDay: form.lateFeePerDay === "" ? null : Number(form.lateFeePerDay),
    };

    try {
      if (editing) {
        await api.put(`/owner/resources/${id}`, payload);
      } else {
        await api.post("/owner/resources", payload);
      }
      navigate("/owner");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this resource.");
    } finally {
      setBusy(false);
    }
  }

  const showBorrowFields = form.resourceType !== "SELL_ONLY";
  const showSellFields = form.resourceType !== "BORROW_ONLY";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        {editing ? "Edit resource" : "Add a resource"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-white/60 p-6">
        {error && <div className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{error}</div>}

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Resource name
          <input required value={form.name} onChange={(e) => update("name", e.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Category
            <select value={form.category} onChange={(e) => update("category", e.target.value)}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Listing type
            <select value={form.resourceType} onChange={(e) => update("resourceType", e.target.value)}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm">
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Description
          <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-forest-500" />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Image URLs
          <div className="flex gap-2">
            <input value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="https://…" className="flex-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
            <button type="button" onClick={addImage} className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-forest-50">
              Add
            </button>
          </div>
        </label>
        {form.imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.imageUrls.map((url, i) => (
              <span key={i} className="flex items-center gap-1 rounded-full bg-forest-50 px-3 py-1 text-xs text-forest-700">
                Image {i + 1}
                <button type="button" onClick={() => removeImage(i)} className="text-clay">×</button>
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Quantity available
            <input required type="number" min={0} value={form.quantityAvailable}
              onChange={(e) => update("quantityAvailable", e.target.value)}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Condition
            <input value={form.condition} onChange={(e) => update("condition", e.target.value)}
              className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Location
          <input value={form.location} onChange={(e) => update("location", e.target.value)}
            className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
        </label>

        {showBorrowFields && (
          <div className="rounded-xl bg-forest-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-700">Borrowing terms</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm text-ink">
                Price per day (₹)
                <input type="number" min={0} value={form.borrowPricePerDay}
                  onChange={(e) => update("borrowPricePerDay", e.target.value)}
                  className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-ink">
                Max duration (days)
                <input type="number" min={1} value={form.maxBorrowDurationDays}
                  onChange={(e) => update("maxBorrowDurationDays", e.target.value)}
                  className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-ink">
                Security deposit (₹)
                <input type="number" min={0} value={form.securityDeposit}
                  onChange={(e) => update("securityDeposit", e.target.value)}
                  className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-ink">
                Late fee / day (₹)
                <input type="number" min={0} value={form.lateFeePerDay}
                  onChange={(e) => update("lateFeePerDay", e.target.value)}
                  className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
              </label>
            </div>
            <label className="mt-3 flex flex-col gap-1 text-sm text-ink">
              Usage rules
              <textarea rows={2} value={form.usageRules} onChange={(e) => update("usageRules", e.target.value)}
                className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
            </label>
          </div>
        )}

        {showSellFields && (
          <div className="rounded-xl bg-ochre-100/50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ochre-600">Selling terms</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm text-ink">
                Selling price (₹)
                <input type="number" min={0} value={form.sellingPrice}
                  onChange={(e) => update("sellingPrice", e.target.value)}
                  className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-ink">
                Discount (%)
                <input type="number" min={0} max={100} value={form.discountPercent}
                  onChange={(e) => update("discountPercent", e.target.value)}
                  className="rounded-lg border border-border bg-paper px-3 py-2 text-sm" />
              </label>
            </div>
          </div>
        )}

        <button disabled={busy} className="mt-2 rounded-full bg-forest-700 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-600 disabled:opacity-60">
          {busy ? "Saving…" : editing ? "Save changes" : "Publish resource"}
        </button>
      </form>
    </div>
  );
}
