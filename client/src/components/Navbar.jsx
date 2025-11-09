import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, Settings, User } from "lucide-react";
import Logo from "./Logo";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  const profileLink = useMemo(() => {
    if (!authUser) return "/login";
    if (authUser.role === "admin") return "/admin";
    if (authUser.role === "supplier") return "/supplier/profile";
    return "/profile";
  }, [authUser]);

  const settingsLink = useMemo(() => {
    if (!authUser) return "/login";
    if (authUser.role === "admin") return "/admin/settings";
    return "/settings";
  }, [authUser]);

  const navLinks = useMemo(() => {
    if (!authUser) {
      return [];
    }

    if (authUser.role === "admin") {
      return [];
    }

    if (authUser.role === "supplier") {
      return [
        { label: "Dashboard", to: "/supplier" },
        { label: "My Bookings", to: "/supplier/bookings" },
        { label: "Profile", to: "/supplier/profile" },
      ];
    }

    return [
      { label: "Home", to: "/" },
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "My Bookings", to: "/my-bookings" },
    ];
  }, [authUser]);

  return (
    <header className="fixed top-0 z-40 w-full border-b border-base-300 bg-base-100/90 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-90 transition"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Logo compact className="h-8 w-8" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-bold">HJ Weddings</p>
            <p className="text-xs text-base-content/60">
              Elegant event planning
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition hover:text-primary ${
                  isActive ? "text-primary" : "text-base-content/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {authUser ? (
            <>
              <Link
                to={settingsLink}
                className="btn btn-ghost btn-sm hidden sm:inline-flex"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>

              <Link
                to={profileLink}
                className="btn btn-outline btn-sm hidden sm:inline-flex"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              <button onClick={logout} className="btn btn-primary btn-sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-ghost btn-sm hidden sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary btn-sm hidden sm:inline-flex"
              >
                Join us
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
