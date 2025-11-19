import { Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import SignUpPage from "../pages/auth/SignupPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyResetCode from "../pages/auth/VerifyResetCode";
import NewPassword from "../pages/auth/NewPassword";
import AuthSuccess from "../pages/auth/AuthSuccess";
import VerifyEmailPage from "../pages/auth/VerifyEmail";

export const AuthRoutes = ({ authUser }) => [
  <Route
    key="signup"
    path="/signup"
    element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
  />,
  <Route
    key="login"
    path="/login"
    element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
  />,
  <Route
    key="forgot-password"
    path="/forgot-password"
    element={!authUser ? <ForgotPassword /> : <Navigate to="/" replace />}
  />,
  <Route
    key="verify-reset-code"
    path="/verify-reset-code"
    element={!authUser ? <VerifyResetCode /> : <Navigate to="/" replace />}
  />,
  <Route
    key="new-password"
    path="/new-password"
    element={!authUser ? <NewPassword /> : <Navigate to="/" replace />}
  />,
  <Route
    key="verify-email"
    path="/verify-email"
    element={!authUser ? <VerifyEmailPage /> : <Navigate to="/" replace />}
  />,
  <Route key="auth-success" path="/auth/success" element={<AuthSuccess />} />,
];
