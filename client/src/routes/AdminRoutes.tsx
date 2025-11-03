import { Routes, Route } from "react-router-dom";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCalendar from "@/pages/admin/AdminCalendar";

import { Bookings } from "@/pages/admin/AdminBookings";

const AdminRoutes = () => (
  <Routes>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/bookings" element={<Bookings />} />
    <Route path="/admin/calendar" element={<AdminCalendar />} />
  </Routes>
);
export default AdminRoutes;
