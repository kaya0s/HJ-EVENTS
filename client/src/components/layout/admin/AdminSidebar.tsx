// src/components/layout/admin/AdminSidebar.tsx
import { NavLink } from "react-router-dom";

const adminNavItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
  { name: "User Management", path: "/admin/users", icon: "👥" },
  { name: "Analytics", path: "/admin/analytics", icon: "📈" },
  { name: "System Settings", path: "/admin/settings", icon: "⚙️" },
  { name: "Reports", path: "/admin/reports", icon: "📄" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive ? "bg-slate-700" : "hover:bg-slate-800"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
