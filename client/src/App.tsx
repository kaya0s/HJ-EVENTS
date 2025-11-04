import { StrictMode, type ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { LoginRoute } from "@/routes/LoginRoute";
import AdminRoutes from "@/routes/AdminRoutes";
import { ClientRoutes } from "@/routes/ClientRoutes";
import { Toaster } from "sonner";
import Footer from "@/components/layout/shared/Footer";
import LiquidEther from "@/components/ui/LiquidEther";

// Helper function to render routes recursively (handles nested routes)
type RouteConfig = {
  path: string;
  element: ReactNode;
  children?: RouteConfig[];
};

const renderRoutes = (routes: RouteConfig[]) => {
  return routes.map((route, index) => {
    if (route.children) {
      return (
        <Route key={index} path={route.path} element={route.element}>
          {renderRoutes(route.children)}
        </Route>
      );
    }
    return <Route key={index} path={route.path} element={route.element} />;
  });
};

const AppContent = () => {
  const { theme } = useTheme();

  return (
    <Router>
      {/* Full-page LiquidEther Background */}
      <div className="fixed inset-0 -z-50 opacity-60">
        <LiquidEther
          colors={
            theme === "dark"
              ? ["#5227FF", "#FF9FFC", "#B19EEF", "#8B5CF6"]
              : ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"]
          }
          mouseForce={20}
          cursorSize={120}
          isViscous={false}
          viscous={30}
          iterationsViscous={28}
          iterationsPoisson={28}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.5}
          takeoverDuration={0.3}
          autoResumeDelay={2000}
          autoRampDuration={0.8}
        />
      </div>

      <div className="relative min-h-screen flex flex-col">
        <Routes>
          {renderRoutes(LoginRoute)}
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<ClientRoutes />} />
        </Routes>
        <div className="mt-auto">
          <Footer />
        </div>
        <Toaster richColors />
      </div>
    </Router>
  );
};

function App() {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="hj-events-theme">
        <AppContent />
      </ThemeProvider>
    </StrictMode>
  );
}

export default App;
