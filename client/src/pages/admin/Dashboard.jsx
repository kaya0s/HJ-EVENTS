import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useBookingStore } from "../../store/useBookingStore";
import BookingFilters from "../../components/admin/BookingFilters";
import AdminSidebar from "../../components/admin/AdminSidebar";
import StatisticsCards from "../../components/admin/StatisticsCards";
import BookingsTable from "../../components/admin/BookingsTable";
import BookingDetailsModal from "../../components/admin/BookingDetailsModal";
import NotificationsPanel from "../../components/admin/NotificationsPanel";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const { bookings, statistics, isLoading, fetchAllBookings, lastFilters } =
    useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAllBookings(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, navigate, fetchAllBookings]);
  const handleApplyFilters = async (nextFilters) => {
    setFilters(nextFilters);
    await fetchAllBookings(nextFilters);
  };

  const handleResetFilters = async () => {
    const reset = {
      search: "",
      status: "all",
      startDate: "",
      endDate: "",
    };
    setFilters(reset);
    await fetchAllBookings(reset);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    // Refresh bookings after modal closes
    fetchAllBookings();
  };

  const handleOpenDashboardReport = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const reportUrl = `${apiUrl}/admin/reports/bookings/pdf`;
    const popup = window.open(reportUrl, "_blank", "noopener");
    if (!popup) {
      toast.error("Please allow pop-ups to preview the PDF.");
    }
  }, []);

  if (authUser?.role !== "admin") {
    return null;
  }
  return (
    <div className="min-h-screen bg-base-100">
      <AdminSidebar />

      {/* Main Content */}
      <main className="lg:ml-20 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-base-content/60">
                Manage bookings, suppliers, and system activities
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary w-full md:w-auto"
              onClick={handleOpenDashboardReport}
            >
              View bookings PDF
            </button>
          </div>

          {/* Overview Content */}
          <div className="space-y-6">
            <StatisticsCards statistics={statistics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bookings Section */}
              <div className="lg:col-span-2">
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title mb-4">Recent Bookings</h2>
                    <BookingFilters
                      initialFilters={lastFilters || filters}
                      onApply={handleApplyFilters}
                      onReset={handleResetFilters}
                    />
                    {isLoading ? (
                      <div className="text-center py-12">
                        <Loader className="animate-spin mx-auto" size={32} />
                      </div>
                    ) : (
                      <BookingsTable
                        bookings={bookings.slice(0, 5)}
                        onViewDetails={handleViewDetails}
                      />
                    )}
                    {bookings.length > 5 && (
                      <div className="card-actions justify-end mt-4">
                        {/* Option to link to all bookings can be handled by navbar now */}
                        {/* No View All Bookings button here anymore */}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notifications Panel */}
              <div className="lg:col-span-1">
                <NotificationsPanel />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
