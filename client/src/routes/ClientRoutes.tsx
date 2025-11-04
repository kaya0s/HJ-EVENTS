import { Routes, Route } from "react-router-dom";
import { ClientHomePage } from "@/pages/client/ClientHomePage";
import { BookingPage } from "@/pages/client/BookingPage";
import { AboutPage } from "@/pages/client/AboutPage";
import { ContactPage } from "@/pages/client/ContactPage";
import { ProfilePage } from "@/pages/client/ProfilePage";

export const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<ClientHomePage />} />
      <Route path="/book" element={<BookingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
};
