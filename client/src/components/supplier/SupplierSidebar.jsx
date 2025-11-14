import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    path: "/supplier",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    path: "/supplier/bookings",
    label: "My Bookings",
    icon: Briefcase,
  },
  {
    path: "/supplier/profile",
    label: "Profile",
    icon: UserCircle,
  },
];

const SupplierSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderNavLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive ? "bg-primary text-primary-content" : "hover:bg-base-300"
          }`
        }
        onClick={() => setIsMobileOpen(false)}
      >
        <Icon size={20} />
        <span className="font-medium">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      <button
        className="lg:hidden absolute top-4 left-4 z-20 btn btn-sm btn-ghost"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        type="button"
        aria-label="Toggle supplier sidebar"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-base-200 border-r border-base-300 z-10"
        style={{ minHeight: "100vh" }}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <CalendarDays className="text-primary" size={24} />
            <h2 className="text-2xl font-bold text-primary">Supplier Portal</h2>
          </div>
          <nav className="space-y-2">{navItems.map(renderNavLink)}</nav>
        </div>
      </aside>

      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-30 cursor-pointer"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <aside
            className="fixed left-0 top-0 h-full w-64 bg-base-200 border-r border-base-300 z-40 transition-transform duration-300 transform translate-x-0"
            style={{ minHeight: "100vh" }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-primary" size={22} />
                  <h2 className="text-xl font-bold text-primary">
                    Supplier Portal
                  </h2>
                </div>
                <button
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={() => setIsMobileOpen(false)}
                  type="button"
                  aria-label="Close sidebar"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-2">{navItems.map(renderNavLink)}</nav>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default SupplierSidebar;
