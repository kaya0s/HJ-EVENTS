// src/components/layout/admin/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavBar";
import AdminSidebar from "./AdminSidebar";
import Footer from "../shared/Footer";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet /> {/* Admin pages render here */}
        </main>

        <Footer />
      </div>
    </div>
  );
}
