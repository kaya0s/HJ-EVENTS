import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLayout from "@/components/layout/admin/AdminLayout";

// Admin routes are wrapped in AdminLayout which provides the sidebar, navbar, and footer.
// All admin pages render inside the <Outlet /> of AdminLayout.
export const AdminRoutes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "",
        element: <AdminDashboard />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      // Add more admin routes here as needed:
      // { path: "users", element: <UserManagement /> },
      // { path: "analytics", element: <Analytics /> },
      // { path: "settings", element: <Settings /> },
      // { path: "reports", element: <Reports /> },
    ],
  },
];
