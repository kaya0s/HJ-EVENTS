import SupplierLayout from "../layouts/SupplierLayout";
import SupplierDashboard from "../pages/supplier/Dashboard";
import SupplierBookings from "../pages/supplier/Bookings";
import SupplierProfile from "../pages/supplier/Profile";

export const supplierRoutes = [
  {
    path: "/supplier",
    element: <SupplierLayout />,
    children: [
      { index: true, element: <SupplierDashboard /> },
      { path: "bookings", element: <SupplierBookings /> },
      { path: "profile", element: <SupplierProfile /> },
    ],
  },
];
