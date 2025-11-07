import AdminDashboard from "../pages/admin/Dashboard";
import AdminBookings from "../pages/admin/Bookings";
import AdminReports from "../pages/admin/Reports";
import AdminLayout from "../layouts/AdminLayout"; // optional layout wrapper

export const adminRoutes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "bookings", element: <AdminBookings /> },
      { path: "reports", element: <AdminReports /> },
    ],
  },
];
