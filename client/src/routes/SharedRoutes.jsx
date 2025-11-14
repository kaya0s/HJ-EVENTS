import { Route, Navigate } from "react-router-dom";
import Profile from "../pages/shared/Profile";
import ThemesPage from "../pages/shared/ThemesPage";
import About from "../pages/shared/About";

export const SharedRoutes = ({ authUser }) => (
  <>
    <Route
      path="/profile"
      element={authUser ? <Profile /> : <Navigate to="/login" replace />}
    />
    <Route path="/themes" element={<ThemesPage />} />
    <Route path="/about" element={<About />} />
  </>
);
