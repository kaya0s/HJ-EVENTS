import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, Palette, User, UserRoundPlus } from "lucide-react";
import Logo from "./Logo";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  const profileLink = useMemo(() => {
    if (!authUser) return "/login";
    if (authUser.role === "admin") return "/profile";
    if (authUser.role === "supplier") return "profile";
    return "/profile";
  }, [authUser]);

  const themesLink = useMemo(() => {
    if (!authUser) return "/themes";
    if (authUser.role === "admin") return "themes";
    return "/themes";
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
    //client
    return [
      { label: "Home", to: "/" },
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "My Bookings", to: "/my-bookings" },
    ];
  }, [authUser]);

  return (
    <header className="fixed top-0 z-40 w-full border-b border-base-300 bg-base-100/90 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between w-full max-w-screen-2xl px-2 md:px-10">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-90 transition"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Logo compact className="h-8 w-8" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-bold">HJ Weddings Events</p>
            <p className="text-xs text-base-content/60">
              Elegant Event Coordination
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            let isActive = location.pathname === link.to;
            if (link.tab) {
              const params = new URLSearchParams(location.search);
              isActive =
                location.pathname === "/admin" &&
                params.get("tab") === link.tab;
            }
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
          {/* Themes button - now always visible */}
          <Link to={themesLink} className="btn btn-ghost btn-sm">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Themes</span>
          </Link>

          {authUser ? (
            <>
              <Link to={profileLink} className="btn btn-ghost btn-sm">
                <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center bg-base-200">
                  {authUser?.profilePic ? (
                    <img
                      src={authUser.profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:inline">Profile</span>
              </Link>

              <button onClick={logout} className="btn btn-primary btn-sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <UserRoundPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Join us</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
