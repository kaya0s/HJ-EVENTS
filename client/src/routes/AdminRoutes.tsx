import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layout/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminCalendar from "../pages/admin/AdminCalendar";

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} /> {/* for /admin */}
      <Route path="calendar" element={<AdminCalendar />} />{" "}
      {/* for /admin/calendar */}
    </Route>
  </Routes>
);
export default AdminRoutes;
