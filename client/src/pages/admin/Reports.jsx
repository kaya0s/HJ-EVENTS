import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ReportsAnalytics from "../../components/admin/ReportsAnalytics";
import { useAuthStore } from "../../store/useAuthStore";
import { useBookingStore } from "../../store/useBookingStore";
import { Loader } from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { bookings, isLoading, fetchAllBookings } = useBookingStore();

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAllBookings();
  }, [authUser, navigate, fetchAllBookings]);

  if (authUser?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <AdminSidebar />
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <header>
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-base-content/60">
              Monitor booking performance, revenue, and upcoming events.
            </p>
          </header>

          {isLoading && bookings.length === 0 ? (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="text-center py-12">
                  <Loader className="animate-spin mx-auto" size={32} />
                </div>
              </div>
            </div>
          ) : (
            <ReportsAnalytics />
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
