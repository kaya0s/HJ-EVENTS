import { Route, Navigate } from "react-router-dom";
import Home from "../pages/client/Home";
import MyBookings from "../pages/client/MyBookings";
import Contact from "../pages/client/Contact";
import PermissionGuard from "../components/PermissionGuard";

export const ClientRoutes = ({ authUser }) => (
  <>
    <Route
      path="/"
      element={
        !authUser ? (
          <Home /> // no auth user → can see homepage
        ) : authUser.role === "user" ? (
          <Home /> // normal user → can see homepage
        ) : authUser.role === "admin" ? (
          <Navigate to="/admin" replace />
        ) : authUser.role === "supplier" ? (
          <Navigate to="/supplier" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />
    <Route
      path="/my-bookings"
      element={
        authUser?.role === "user" ? (
          <PermissionGuard role="user" permission="viewBookings">
            <MyBookings />
          </PermissionGuard>
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />
  </>
);
