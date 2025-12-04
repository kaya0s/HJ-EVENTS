import { Route, Navigate } from "react-router-dom";
import SupplierDashboard from "../pages/supplier/Dashboard";
import SupplierBookings from "../pages/supplier/MyBookings";
import SupplierProfile from "../pages/supplier/Profile";
import PermissionGuard from "../components/PermissionGuard";

export const SupplierRoutes = ({ authUser }) => (
  <>
    <Route
      path="/supplier"
      element={
        authUser?.role === "supplier" ? (
          <PermissionGuard role="supplier" permission="viewBookings">
            <SupplierDashboard />
          </PermissionGuard>
        ) : (
          <Navigate to="/" replace />
        )
      }
    />
    <Route
      path="/supplier/bookings"
      element={
        authUser?.role === "supplier" ? (
          <PermissionGuard role="supplier" permission="viewBookings">
            <SupplierBookings />
          </PermissionGuard>
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
