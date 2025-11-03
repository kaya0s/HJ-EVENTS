import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen,
  Users, 
  Package,
  Settings,
} from "lucide-react";
import { HJLogo } from "@/components/hj-logo";

const adminNavItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard }, 
  { name: "Calendar", path: "/admin/calendar", icon: Calendar },
  { name: "Package", path: "/admin/managePackage", icon: Package },
  { name: "Bookings", path: "/admin/bookings", icon: BookOpen },
  { name: "Suppliers", path: "/admin/supplier", icon: Users },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto" style={{ backgroundColor: '#FFF8F2' }}>
      <div className="p-6 flex flex-col items-center gap-3"> 
        <HJLogo className="w-15 h-16" />
        <h2 className="text-xl font-semibold text-gray-900">HJ Events</h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-white/90 text-gray-900 shadow-sm" 
                  : "text-gray-900 hover:bg-white/60"
              }`
            }
          >
            <span className="w-5 h-5">
              {React.createElement(item.icon, { size: 20, className: "text-gray-900" })}
            </span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
