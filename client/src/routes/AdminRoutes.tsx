import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layout/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCalendar from "../pages/admin/AdminCalendar";
import AdminBookings from "@/pages/admin/AdminBookings";

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} /> {/* for /admin */}
      <Route path="calendar" element={<AdminCalendar />} />{" "}
      <Route path="bookings" element={<AdminBookings />} />{" "}
      {/* for /admin/calendar */}
    </Route>
  </Routes>
);
export default AdminRoutes;
