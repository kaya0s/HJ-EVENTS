import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Menu,
  X,
  Package,
  CalendarDays,
  FileText,
} from "lucide-react";
import { useState } from "react";

const AdminSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
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

  const renderNavLink = (item) => {
    const Icon = item.icon;
    const baseClasses =
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors";
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        className={({ isActive }) =>
          `${baseClasses} ${
            isActive ? "bg-primary text-primary-content" : "hover:bg-base-300"
          }`
        }
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
              {navItems.map((item) => renderNavLink(item))}
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
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-primary-content"
                            : "hover:bg-base-300"
                        }`
                      }
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  ))}
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
