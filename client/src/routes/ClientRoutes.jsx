import { Route, Navigate } from "react-router-dom";
import Home from "../pages/client/Home";
import About from "../pages/client/About";
import Contact from "../pages/client/Contact";
import MyBookings from "../pages/client/MyBookings";
import Profile from "../pages/client/Profile";
import ThemesPage from "../pages/ThemesPage";

export const ClientRoutes = ({ authUser }) => (
  <>
    <Route path="/" element={<Home />} />
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
    <Route
      path="/profile"
      element={authUser ? <Profile /> : <Navigate to="/login" replace />}
    />
    <Route
      path="/themes"
      element={authUser ? <ThemesPage /> : <Navigate to="/login" replace />}
    />
  </>
);
