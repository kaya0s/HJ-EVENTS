import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackgroundVideo from "./components/BackgroundVideo";

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
    <BackgroundVideo videoSrc="https://www.pexels.com/download/video/8776122/">
      {/* <div className="bg-linear-to-b from-base-100 via-base-200/60 to-base-100" /> */}
      <div
        data-theme={theme}
        // className="min-h-screen bg-base-100 text-base-content flex flex-col"
      />
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
    </BackgroundVideo>
  );
};

export default App;
