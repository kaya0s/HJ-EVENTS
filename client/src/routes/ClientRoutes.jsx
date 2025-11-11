import { Route, Navigate } from "react-router-dom";
import Home from "../pages/client/Home";
import About from "../pages/client/About";
import Contact from "../pages/client/Contact";
import MyBookings from "../pages/client/MyBookings";
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
      path="/about"
      element={
        authUser?.role === "user" ? <About /> : <Navigate to="/login" replace />
      }
    />
    <Route
      path="/contact"
      element={
        authUser?.role === "user" ? (
          <Contact />
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />
    <Route
      path="/my-bookings"
      element={
        authUser?.role === "user" ? (
          <MyBookings />
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />
  </>
);
