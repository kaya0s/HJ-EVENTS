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
import { usePermissionsStore } from "../../store/usePermissionsStore";

const navItems = [
  {
    path: "/supplier",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
    // Dashboard is always visible; content is gated inside the page.
  },
  {
    path: "/supplier/bookings",
    label: "My Bookings",
    icon: Briefcase,
    requires: { role: "supplier", key: "viewBookings" },
  },
  {
    path: "/supplier/profile",
    label: "Profile",
    icon: UserCircle,
    // Profile is always visible; editing is gated inside the page.
  },
];

const SupplierSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAllowed = usePermissionsStore((state) => state.isAllowed);
  const permsLoaded = usePermissionsStore((state) => state.isLoaded);

  const isItemVisible = (item) => {
    if (!item.requires) return true;
    // Until permissions are loaded, be conservative and hide sensitive items.
    if (!permsLoaded) return false;
    return isAllowed(item.requires.role, item.requires.key);
  };

  const renderNavLink = (item) => {
    if (!isItemVisible(item)) return null;
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        className={({ isActive }) =>
          `relative flex items-center py-2.5 rounded-lg transition-colors group ${
            isActive ? "bg-primary text-primary-content" : "hover:bg-base-300"
          }`
        }
        onClick={() => setIsMobileOpen(false)}
      >
        <div className="flex items-center justify-center shrink-0 w-16">
          <Icon size={20} />
        </div>
        <span
          className={`font-medium transition-all duration-300 whitespace-nowrap origin-left
            ${
              isCollapsed
                ? "opacity-0 pointer-events-none w-0 overflow-hidden scale-x-0"
                : "opacity-100 w-auto scale-x-100 ml-1"
            }`}
          style={{
            transitionProperty: "opacity, width, margin, transform",
            minWidth: isCollapsed ? 0 : undefined,
          }}
        >
          {item.label}
        </span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-40 btn btn-sm btn-ghost"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        type="button"
        aria-label="Toggle supplier sidebar"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop sidebar - matches admin collapsed style */}
      <aside
        className={`hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] bg-base-200 border-r border-base-300 transition-all duration-300 z-30 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden pt-4">
          <nav className="space-y-1 px-2 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4 px-2"></div>
            {navItems.map(renderNavLink)}
          </nav>
        </div>
      </aside>

      {/* Mobile drawer */}
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
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
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
              <nav className="space-y-2 flex-1 overflow-y-auto">
                {navItems.map(renderNavLink)}
              </nav>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default SupplierSidebar;
