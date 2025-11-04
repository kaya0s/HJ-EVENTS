import React from 'react';
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="relative h-screen w-full bg-background">
      {/* Main layout container with sidebar */}
      <div className="flex h-full">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background transition-colors">
          {/* Top navigation */}
          <AdminNavbar />
          
          {/* Main content with padding and scroll */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-8 py-6">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
