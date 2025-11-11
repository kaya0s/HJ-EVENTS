import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  FileText,
  Menu,
  X,
  Package,
} from "lucide-react";
import { useState } from "react";

const AdminSidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    {
      path: "/admin?tab=bookings",
      label: "Bookings",
      icon: Calendar,
      tab: "bookings",
    },
    {
      path: "/admin?tab=suppliers",
      label: "Suppliers",
      icon: Users,
      tab: "suppliers",
    },
    {
      path: "/admin?tab=clients",
      label: "Clients & Users",
      icon: UserCheck,
      tab: "clients",
    },
    { path: "/admin/packages", label: "Packages", icon: Package },
  ];

  const isActive = (item) => {
    if (item.tab) {
      const params = new URLSearchParams(location.search);
      return params.get("tab") === item.tab;
    }
    if (item.path === "/admin") {
      return location.pathname === "/admin" && !location.search;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <>
      <button
        className="lg:hidden absolute top-4 left-4 z-20 btn btn-sm btn-ghost"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        type="button"
        aria-label="Toggle admin sidebar"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div>
        <aside
          className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-base-200 border-r border-base-300 z-10"
          style={{ minHeight: "100vh" }}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-8">
              Admin Panel
            </h2>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item)
                        ? "bg-primary text-primary-content"
                        : "hover:bg-base-300"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        {isMobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30 cursor-pointer"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Sidebar overlay"
            />
            <aside
              className="fixed left-0 top-0 h-full w-64 bg-base-200 border-r border-base-300 z-40 transition-transform duration-300 transform translate-x-0"
              style={{ minHeight: "100vh" }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-primary">
                    Admin Panel
                  </h2>
                  <button
                    className="btn btn-sm btn-circle btn-ghost"
                    onClick={() => setIsMobileOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(item)
                            ? "bg-primary text-primary-content"
                            : "hover:bg-base-300"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>
          </>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;
