// src/components/layout/admin/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => (
  <div className="flex flex-1 min-h-screen">
    <AdminSidebar />

    <div className="flex-1 flex flex-col min-h-0">
      <AdminNavbar />
      <main className="flex-1 p-4 overflow-auto">
        <Outlet /> {/* This renders the nested route */}
      </main>
    </div>
  </div>
);
export default AdminLayout;
