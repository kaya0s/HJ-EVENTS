import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import BookingsTable from "../../components/admin/BookingsTable";
import BookingDetailsModal from "../../components/admin/BookingDetailsModal";
import { useAuthStore } from "../../store/useAuthStore";
import { useBookingStore } from "../../store/useBookingStore";
import BookingFilters from "../../components/admin/BookingFilters";

const Bookings = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { bookings, isLoading, fetchAllBookings, lastFilters } =
    useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState(null);
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
    // intentionally run only when auth context changes
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

  const showModal = Boolean(selectedBooking);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseModal = async () => {
    setSelectedBooking(null);
    await fetchAllBookings();
  };

  if (authUser?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <AdminSidebar />
      <main className="lg:ml-20 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <header>
            <h1 className="text-3xl font-bold mb-2">Bookings</h1>
            <p className="text-base-content/60">
              Review, approve, or reject wedding bookings.
            </p>
          </header>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title">All Bookings</h2>
                <span className="badge badge-primary badge-outline">
                  {bookings.length} total
                </span>
              </div>

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
                  bookings={bookings}
                  onViewDetails={handleViewDetails}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {showModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Bookings;
