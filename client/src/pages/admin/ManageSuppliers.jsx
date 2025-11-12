import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import SuppliersSection from "../../components/admin/SuppliersSection";
import { useAuthStore } from "../../store/useAuthStore";

const ManageSuppliers = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
    }
  }, [authUser, navigate]);

  if (authUser?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <AdminSidebar />
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <header>
            <h1 className="text-3xl font-bold mb-2">Manage Suppliers</h1>
            <p className="text-base-content/60">
              Invite new suppliers, adjust availability, and manage assignments.
            </p>
          </header>

          <SuppliersSection />
        </div>
      </main>
    </div>
  );
};

export default ManageSuppliers;
