import { Navigate } from "react-router-dom";
import LoginPage from "@/pages/login/LoginPage";
import SignupPage from "@/pages/login/SignupPage";
import ForgotPasswordPage from "@/pages/login/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/login/ResetPasswordPage";
import AuthSuccessPage from "@/pages/login/AuthSuccessPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";

export const LoginRoute = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/auth/success",
    element: <AuthSuccessPage />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
];
