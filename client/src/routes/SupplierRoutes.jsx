import { Route, Navigate } from "react-router-dom";
import SupplierDashboard from "../pages/supplier/Dashboard";
import SupplierBookings from "../pages/supplier/MyBookings";
import SupplierProfile from "../pages/supplier/Profile";

export const SupplierRoutes = ({ authUser }) => (
  <>
    <Route
      path="/supplier"
      element={
        authUser?.role === "supplier" ? (
          <SupplierDashboard />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />
    <Route
      path="/supplier/bookings"
      element={
        authUser?.role === "supplier" ? (
          <SupplierBookings />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />
    <Route
      path="/supplier/profile"
      element={
        authUser?.role === "supplier" ? (
          <SupplierProfile />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />
  </>
);
