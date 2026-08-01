const STYLES = {
  AVAILABLE: "bg-forest-50 text-forest-700",
  RESERVED: "bg-ochre-100 text-ochre-600",
  BORROWED: "bg-sky/10 text-sky",
  OUT_OF_STOCK: "bg-clay/10 text-clay",
  UNDER_MAINTENANCE: "bg-ochre-100 text-ochre-600",
  REMOVED: "bg-ink/10 text-ink-soft",

  PENDING: "bg-ochre-100 text-ochre-600",
  APPROVED: "bg-forest-50 text-forest-700",
  REJECTED: "bg-clay/10 text-clay",
  OTP_VERIFIED: "bg-sky/10 text-sky",
  PICKED_UP: "bg-sky/10 text-sky",
  ACTIVE: "bg-sky/10 text-sky",
  RETURN_REQUESTED: "bg-ochre-100 text-ochre-600",
  RETURNED: "bg-forest-50 text-forest-700",
  COMPLETED: "bg-forest-50 text-forest-700",
  CANCELLED: "bg-ink/10 text-ink-soft",

  PENDING_PAYMENT: "bg-ochre-100 text-ochre-600",
  PAID: "bg-sky/10 text-sky",
  OUT_FOR_DELIVERY: "bg-sky/10 text-sky",
  DELIVERED: "bg-forest-50 text-forest-700",

  OPEN: "bg-clay/10 text-clay",
  UNDER_REVIEW: "bg-ochre-100 text-ochre-600",
  RESOLVED: "bg-forest-50 text-forest-700",
};

export default function StatusPill({ status }) {
  const cls = STYLES[status] || "bg-ink/10 text-ink-soft";
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${cls}`}>
      {status?.replaceAll("_", " ")}
    </span>
  );
}
