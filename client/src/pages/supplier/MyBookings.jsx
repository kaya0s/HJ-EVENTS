import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import SupplierSidebar from "../../components/supplier/SupplierSidebar";
import SupplierBookingsTable from "../../components/supplier/SupplierBookingsTable";
import SupplierBookingDetailsModal from "../../components/supplier/SupplierBookingDetailsModal";
import { useAuthStore } from "../../store/useAuthStore";
import { useSupplierDashboardStore } from "../../store/useSupplierDashboardStore";

const MyBookings = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const { bookings, isLoadingBookings, fetchSupplierBookings } =
    useSupplierDashboardStore();
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (authUser?.role !== "supplier") {
      navigate("/");
      return;
    }
    fetchSupplierBookings();
  }, [authUser, navigate, fetchSupplierBookings]);

  if (authUser?.role !== "supplier") {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <SupplierSidebar />
      <main className="lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <header>
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-base-content/60">
              Review your assigned weddings, check schedules, and keep track of
              client details.
            </p>
          </header>

          <section className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title">Assigned Weddings</h2>
                <span className="badge badge-outline badge-primary">
                  {bookings.length} total
                </span>
              </div>
              {isLoadingBookings ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-primary" size={28} />
                </div>
              ) : (
                <SupplierBookingsTable
                  bookings={bookings}
                  onViewDetails={(booking) => setSelectedBooking(booking)}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      <SupplierBookingDetailsModal
        booking={selectedBooking}
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
};

export default MyBookings;
