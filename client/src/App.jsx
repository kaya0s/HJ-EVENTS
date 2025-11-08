import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignupPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyResetCode from "./pages/auth/VerifyResetCode";
import NewPassword from "./pages/auth/NewPassword";
import AuthSuccess from "./pages/auth/AuthSuccess";

import Home from "./pages/client/Home";
import About from "./pages/client/About";
import Contact from "./pages/client/Contact";
import MyBookings from "./pages/client/MyBookings";
import Profile from "./pages/client/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import ManageClients from "./pages/admin/ManageClients";
import ManageSuppliers from "./pages/admin/ManageSuppliers";
import Reports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";

import SupplierDashboard from "./pages/supplier/Dashboard";
import SupplierBookings from "./pages/supplier/MyBookings";
import SupplierProfile from "./pages/supplier/Profile";

import SettingsPage from "./pages/SettingsPage";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-base-100 text-base-content flex flex-col"
    >
      <Navbar />

      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth Routes */}
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/forgot-password"
            element={
              !authUser ? <ForgotPassword /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/verify-reset-code"
            element={
              !authUser ? <VerifyResetCode /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/new-password"
            element={!authUser ? <NewPassword /> : <Navigate to="/" replace />}
          />
          <Route
            path="/auth/success"
            element={<AuthSuccess />}
          />

          {/* Client Routes */}
          <Route
            path="/about"
            element={
              authUser?.role === "user" ? (
                <About />
              ) : (
                <Navigate to="/login" replace />
              )
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

          {/* Admin Routes */}

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
            path="/admin/reports"
            element={
              authUser?.role === "admin" ? (
                <Reports />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/settings"
            element={
              authUser?.role === "admin" ? (
                <AdminSettings />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Supplier Routes */}
          <Route
            path="/"
            element={
              authUser?.role === "supplier" ? (
                <SupplierDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

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

          {/* Shared */}
          <Route
            path="/settings"
            element={
              authUser ? <SettingsPage /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
};
export default App;
