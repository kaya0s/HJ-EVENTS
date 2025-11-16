import { Link, useLocation, NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogOut,
  Palette,
  User,
  UserRoundPlus,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Package,
  CalendarDays,
  FileText,
  ChevronDown,
  Home,
  Info,
  Mail,
  CalendarCheck,
} from "lucide-react";
import Logo from "./Logo";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const adminNavItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      path: "/admin/bookings",
      label: "Bookings",
      icon: Calendar,
    },
    {
      path: "/admin/clients",
      label: "Clients & Users",
      icon: UserCheck,
    },
    {
      path: "/admin/suppliers",
      label: "Suppliers",
      icon: Users,
    },
    {
      path: "/admin/calendar",
      label: "Wedding Calendar",
      icon: CalendarDays,
    },
    {
      path: "/admin/packages",
      label: "Packages",
      icon: Package,
    },
    {
      path: "/admin/reports",
      label: "Reports & Analytics",
      icon: FileText,
    },
  ];

  const userNavItems = [
    {
      path: "/",
      label: "Home",
      icon: Home,
      end: true,
    },
    {
      path: "/about",
      label: "About",
      icon: Info,
    },
    {
      path: "/contact",
      label: "Contact",
      icon: Mail,
    },
    {
      path: "/my-bookings",
      label: "My Bookings",
      icon: CalendarCheck,
    },
  ];

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
      <div className="container mx-auto flex h-16 items-center justify-between w-full max-w-screen-2xl px-4 md:px-10">
        {/* Mobile: Dropdown on left of logo; Desktop: hidden */}
        {authUser?.role === "admin" && (
          <div className="relative flex md:hidden">
            <button
              onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
              className="btn btn-ghost btn-sm flex items-center gap-2"
              aria-label="Admin menu"
            >
              <Menu size={20} />
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isAdminDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isAdminDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsAdminDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-64 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-[calc(100vh-5rem)] overflow-y-auto">
                  <div className="p-2">
                    <div className="px-4 py-2 border-b border-base-300">
                      <h3 className="text-sm font-semibold text-primary">
                        Admin Panel
                      </h3>
                    </div>
                    <nav className="space-y-1">
                      {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                                isActive
                                  ? "bg-primary text-primary-content"
                                  : "hover:bg-base-200 text-base-content"
                              }`
                            }
                          >
                            <Icon size={18} />
                            <span className="font-medium">{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* User Mobile Dropdown - only visible on mobile for regular users */}
        {authUser?.role === "user" && (
          <div className="relative flex md:hidden">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="btn btn-ghost btn-sm flex items-center gap-2"
              aria-label="User menu"
            >
              <Menu size={20} />
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isUserDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isUserDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-64 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-[calc(100vh-5rem)] overflow-y-auto">
                  <div className="p-2">
                    <div className="px-4 py-2 border-b border-base-300">
                      <h3 className="text-sm font-semibold text-primary">
                        Menu
                      </h3>
                    </div>
                    <nav className="space-y-1">
                      {userNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setIsUserDropdownOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                                isActive
                                  ? "bg-primary text-primary-content"
                                  : "hover:bg-base-200 text-base-content"
                              }`
                            }
                          >
                            <Icon size={18} />
                            <span className="font-medium">{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-90 transition"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Logo compact className="h-8 w-8" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-bold">
              <span className="sm:hidden">HJ Weddings</span>
              <span className="hidden sm:inline">HJ Weddings Events</span>
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

        {/* Admin dropdown moved to left; so hide/disable here */}
        {/* (Previously: {authUser?.role === "admin" && ... } now in left of logo) */}

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
