import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Package,
  CalendarDays,
  FileText,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

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
    {
      path: "/admin/faqs",
      label: "FAQs",
      icon: HelpCircle,
    },
  ];

  const renderNavLink = (item) => {
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
      >
        {/* Icon container - fixed width, always left-aligned */}
        <div className="flex items-center justify-center flex-shrink-0 w-16">
          <Icon size={20} />
        </div>
        {/* Text label - fades in/out, does not push icon */}
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
    <aside
      className={`hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] bg-base-200 border-r border-base-300 transition-all duration-300 z-30 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header - icon is fixed left, label slides in/out */}

        {/* Navigation - reduced padding, scrollable if needed */}
        <nav className="space-y-1 px-2 flex-1 overflow-y-auto">
          {navItems.map(renderNavLink)}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
