import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackgroundVideo from "./components/BackgroundVideo";
import NotFound from "./pages/shared/NotFound";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { usePermissionsStore } from "./store/usePermissionsStore";
import {
  AuthRoutes,
  ClientRoutes,
  AdminRoutes,
  SupplierRoutes,
  SharedRoutes,
} from "./routes";

const App = () => {
  const location = useLocation();
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const initializePermissions = usePermissionsStore(
    (state) => state.initialize
  );

  useEffect(() => {
    checkAuth();
    // We intentionally run this only once on mount. The `checkAuth` action from
    // the store is stable, but including it in the dependency array can cause
    // unnecessary re-runs if its reference ever changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && authUser) {
      initializePermissions();
    }
  }, [authUser, isCheckingAuth, initializePermissions]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  const showBackgroundVideo = !authUser || authUser.role === "user";

  const content = (
    <>
      <Navbar />

      <main className="flex-1 pt-16">
        <Routes>
          {AuthRoutes({ authUser })}
          {SharedRoutes({ authUser })}
          {ClientRoutes({ authUser })}
          {AdminRoutes({ authUser })}
          {SupplierRoutes({ authUser })}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {(location.pathname === "/" ||
        location.pathname === "/about" ||
        location.pathname === "/contact" ||
        location.pathname === "/my-bookings") && <Footer />}
      <Toaster />
    </>
  );

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-base-100 text-base-content flex flex-col"
    >
      {showBackgroundVideo ? (
        <BackgroundVideo videoSrc="https://www.pexels.com/download/video/34506425/">
          {content}
        </BackgroundVideo>
      ) : (
        content
      )}
    </div>
  );
};

export default App;
