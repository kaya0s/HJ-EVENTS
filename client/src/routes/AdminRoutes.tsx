import { Routes, Route } from "react-router-dom";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCalendar from "@/pages/admin/AdminCalendar";

import { Bookings } from "@/pages/admin/AdminBookings";
import Supplier from "@/pages/admin/Supplier";
import PackageManagement from "@/pages/admin/PackageManagement";

const AdminRoutes = () => (
  <Routes>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/bookings" element={<Bookings />} />
    <Route path="/admin/calendar" element={<AdminCalendar />} />
    <Route path="/admin/suppliers" element={<Supplier />} />
    <Route path="/admin/packages" element={<PackageManagement />} />
  </Routes>
);
export default AdminRoutes;
