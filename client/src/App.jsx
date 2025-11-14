import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import {
  AuthRoutes,
  ClientRoutes,
  AdminRoutes,
  SupplierRoutes,
  SharedRoutes,
} from "./routes";

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
          {AuthRoutes({ authUser })}
          {SharedRoutes({ authUser })}
          {ClientRoutes({ authUser })}
          {AdminRoutes({ authUser })}
          {SupplierRoutes({ authUser })}
        </Routes>
      </main>
      {authUser?.role !== "admin" && <Footer />}
      <Toaster />
    </div>
  );
};

export default App;
