import { Route, Navigate } from "react-router-dom";
import AdminDashboard from "../pages/admin/Dashboard";
import ManageClients from "../pages/admin/ManageClients";
import ManageSuppliers from "../pages/admin/ManageSuppliers";
import Reports from "../pages/admin/Reports";
import Packages from "../pages/admin/Packages";
import Bookings from "../pages/admin/Bookings";
import Calendar from "../pages/admin/Calendar";

export const AdminRoutes = ({ authUser }) => (
  <>
    <Route
      path="/admin"
      element={
        authUser?.role === "admin" ? (
          <AdminDashboard />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />
    <Route
      path="/admin/clients"
      element={
        authUser?.role === "admin" ? (
          <ManageClients />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />
    <Route
      path="/admin/suppliers"
      element={
        authUser?.role === "admin" ? (
          <ManageSuppliers />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />
    <Route
      path="/admin/bookings"
      element={
        authUser?.role === "admin" ? <Bookings /> : <Navigate to="/" replace />
      }
    />
    <Route
      path="/admin/calendar"
      element={
        authUser?.role === "admin" ? <Calendar /> : <Navigate to="/" replace />
      }
    />
    <Route
      path="/admin/reports"
      element={
        authUser?.role === "admin" ? <Reports /> : <Navigate to="/" replace />
      }
    />
    <Route
      path="/admin/packages"
      element={
        authUser?.role === "admin" ? <Packages /> : <Navigate to="/" replace />
      }
    />
  </>
);
