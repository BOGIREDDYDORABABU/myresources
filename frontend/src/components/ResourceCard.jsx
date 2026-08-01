import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import StatusPill from "./StatusPill";

const CATEGORY_ICONS = {
  BOOKS: "📚",
  ELECTRONICS: "🔌",
  SPORTS: "🏸",
  FURNITURE: "🪑",
  VEHICLES: "🚲",
  MEDICAL_EQUIPMENT: "🩺",
  TOOLS: "🛠️",
  LAB_EQUIPMENT: "🧪",
  MUSICAL_INSTRUMENTS: "🎸",
  OTHERS: "📦",
};

export default function ResourceCard({ resource }) {
  const img = resource.imageUrls?.[0];
  return (
    <Link
      to={`/resources/${resource.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white/60 transition-shadow hover:shadow-lg"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-forest-50">
        {img ? (
          <img src={img} alt={resource.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <span className="text-5xl">{CATEGORY_ICONS[resource.category] || "📦"}</span>
        )}
        <div className="absolute left-2 top-2">
          <StatusPill status={resource.status} />
        </div>
        {resource.discountPercent > 0 && (
          <div className="absolute right-2 top-2 rounded-full bg-clay px-2 py-1 text-xs font-bold text-paper">
            -{resource.discountPercent}%
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-ink line-clamp-1">{resource.name}</h3>
          {resource.verified && <span title="Verified" className="text-forest-600">✓</span>}
        </div>
        <p className="text-xs uppercase tracking-wide text-ink-soft">{resource.category?.replaceAll("_", " ")}</p>
        {resource.location && (
          <p className="flex items-center gap-1 text-xs text-ink-soft">
            <MapPin size={12} /> {resource.location}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1 font-display text-forest-700">
            {resource.sellingPrice ? (
              <span className="font-semibold">₹{resource.sellingPrice}</span>
            ) : resource.borrowPricePerDay ? (
              <span className="font-semibold">₹{resource.borrowPricePerDay}/day</span>
            ) : (
              <span className="text-sm text-ink-soft">Contact owner</span>
            )}
          </div>
          {resource.averageRating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-ochre-600">
              <Star size={12} fill="currentColor" /> {resource.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
