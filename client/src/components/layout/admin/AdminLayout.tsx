import React from 'react';
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="relative h-screen w-full">
      {/* Main layout container with sidebar */}
      <div className="flex h-full">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top navigation */}
          <AdminNavbar />
          
          {/* Main content with padding and scroll */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container mx-auto p-6">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
