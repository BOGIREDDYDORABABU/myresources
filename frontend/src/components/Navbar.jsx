import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, LayoutDashboard, LogOut, Sprout } from "lucide-react";
import { useState } from "react";

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-full transition-colors ${
    isActive ? "bg-forest-700 text-paper" : "text-ink-soft hover:bg-forest-50"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const dashboardPath =
    user?.role === "ADMIN" ? "/admin" : user?.role === "OWNER" ? "/owner" : "/me";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 text-paper">
            <Sprout size={18} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-forest-900">
            My Resources
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={linkClass}>
            Browse
          </NavLink>
          {user?.role === "BORROWER" && (
            <>
              <NavLink to="/me/wishlist" className={linkClass}>
                Wishlist
              </NavLink>
              <NavLink to="/me/borrows" className={linkClass}>
                My Borrows
              </NavLink>
              <NavLink to="/me/purchases" className={linkClass}>
                My Purchases
              </NavLink>
            </>
          )}
          {user?.role === "OWNER" && (
            <>
              <NavLink to="/owner" end className={linkClass}>
                My Resources
              </NavLink>
              <NavLink to="/owner/requests" className={linkClass}>
                Requests
              </NavLink>
            </>
          )}
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={linkClass}>
              Admin Console
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-forest-50"
              >
                <LayoutDashboard size={16} />
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:bg-forest-50"
              >
                <LogOut size={16} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft hover:bg-forest-50"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-forest-700 px-4 py-2 text-sm font-medium text-paper hover:bg-forest-600"
              >
                Join
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
              Browse
            </NavLink>
            {user ? (
              <>
                <Link to={dashboardPath} className="px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="px-3 py-2 text-left text-sm font-medium text-clay">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
