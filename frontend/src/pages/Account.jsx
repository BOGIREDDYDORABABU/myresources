import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Heart, PackageOpen, ShoppingBag, AlertTriangle, Settings } from "lucide-react";

export default function Account() {
  const { user } = useAuth();

  const cards = [
    { to: "/me/wishlist", icon: Heart, label: "Wishlist", desc: "Resources you've saved" },
    { to: "/me/borrows", icon: PackageOpen, label: "My Borrows", desc: "Track requests and active borrows" },
    { to: "/me/purchases", icon: ShoppingBag, label: "My Purchases", desc: "Order history" },
    { to: "/me/settings", icon: Settings, label: "Account Settings", desc: "Update profile, email, or password" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Hi, {user?.name?.split(" ")[0]}</h1>
      <p className="mb-8 text-sm text-ink-soft">{user?.email || user?.phone} · {user?.location || "No location set"}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-2xl border border-border bg-white/60 p-5 hover:shadow-md">
            <c.icon className="mb-3 text-forest-600" size={22} />
            <p className="font-display font-semibold text-ink">{c.label}</p>
            <p className="text-xs text-ink-soft">{c.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-border p-5">
        <p className="mb-2 flex items-center gap-2 font-display font-semibold text-ink">
          <AlertTriangle size={18} className="text-clay" /> Had an issue?
        </p>
        <p className="mb-3 text-sm text-ink-soft">
          Raise a complaint about a fake or damaged resource, fraud, a late return, or a payment problem.
        </p>
        <Link to="/complaints/new" className="inline-block rounded-full bg-clay px-4 py-2 text-sm font-semibold text-paper hover:opacity-90">
          File a complaint
        </Link>
      </div>
    </div>
  );
}
