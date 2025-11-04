import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  Package,
  Settings,
  LogOut,
} from "lucide-react";

const adminNavItems = [
  { 
    section: "GENERAL",
    items: [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard }, 
      { name: "Calendar", path: "/admin/calendar", icon: Calendar },
      { name: "Package", path: "/admin/managePackage", icon: Package },
      { name: "Bookings", path: "/admin/bookings", icon: BookOpen },
      { name: "Suppliers", path: "/admin/supplier", icon: Users },
    ]
  },
  {
    section: "ACCOUNT",
    items: [
      { name: "Settings", path: "/admin/settings", icon: Settings },
    ]
  }
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 flex flex-col flex-shrink-0 sticky top-0 h-screen bg-sidebar transition-colors">
      <div className="p-5 border-b border-border"> 
        <div className="flex items-center gap-2">
          <div className="w-10 h-10">
            <img src="/HJ_Logo.png" alt="HJ Events Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">HJ Events</h2>
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col">
        {adminNavItems.map((section) => (
          <div key={section.section} className="mb-6">
            <div className="px-5 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground/70">{section.section}</h3>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-2.5 transition-colors ${
                      isActive 
                        ? "bg-accent text-accent-foreground border-r-2 border-primary" 
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    }`
                  }
                >
                  <span className="w-5 h-5">
                    {React.createElement(item.icon, { size: 18 })}
                  </span>
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-auto border-t border-border pt-4 px-5">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="flex items-center justify-center gap-3 text-muted-foreground hover:text-accent-foreground hover:bg-accent/50 w-full px-5 py-2.5 transition-colors rounded-sm"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
