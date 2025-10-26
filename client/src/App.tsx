import { StrictMode } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginRoute } from "@/routes/LoginRoute";
import AdminRoutes from "@/routes/AdminRoutes";

// Helper function to render routes recursively (handles nested routes)
const renderRoutes = (routes: any[]) => {
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

function App() {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="hj-events-theme">
        <Router>
          <div className="relative min-h-screen">
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>

            <Routes>
              {renderRoutes(LoginRoute)}
              <Route path="/admin/*" element={<AdminRoutes />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </StrictMode>
  );
}

export default App;
