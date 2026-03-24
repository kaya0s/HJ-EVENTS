import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import SupplierSidebar from "../../components/supplier/SupplierSidebar";
import SupplierBookingsTable from "../../components/supplier/SupplierBookingsTable";
import SupplierBookingDetailsModal from "../../components/supplier/SupplierBookingDetailsModal";
import { useAuthStore } from "../../store/useAuthStore";
import { useSupplierDashboardStore } from "../../store/useSupplierDashboardStore";
import { usePermissionsStore } from "../../store/usePermissionsStore";

const MyBookings = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const { bookings, isLoadingBookings, fetchSupplierBookings } =
    useSupplierDashboardStore();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const permsLoaded = usePermissionsStore((state) => state.isLoaded);
  const isAllowed = usePermissionsStore((state) => state.isAllowed);
  const canViewBookings = permsLoaded && isAllowed("supplier", "viewBookings");

  useEffect(() => {
    if (authUser?.role !== "supplier") {
      navigate("/");
      return;
    }
    if (!canViewBookings) return;
    const loadBookings = async () => {
      try {
        setFetchError(null);
        await fetchSupplierBookings();
      } catch (error) {
        // Error is already shown as toast in the store
        // Extract the error message for UI display
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch bookings";
        setFetchError(`Failed to fetch bookings: ${errorMessage}`);
      }
    };
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.role, navigate, canViewBookings]);

  if (authUser?.role !== "supplier") {
    return null;
  }

  if (!permsLoaded) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 text-center">
        <div className="max-w-xl space-y-4">
          <p className="text-base-content/70">Loading your supplier access…</p>
        </div>
      </div>
    );
  }

  if (!canViewBookings) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 text-center">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-bold">Feature Disabled</h1>
          <p className="text-base-content/70">
            This feature is disabled by the admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 lg:flex">
      <SupplierSidebar />
      <main className="flex-1 p-6 transition-all duration-300 lg:ml-64">
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
              {fetchError ? (
                <div className="alert alert-error">
                  <div>
                    <h3 className="font-semibold">Error</h3>
                    <p className="text-sm">{fetchError}</p>
                  </div>
                </div>
              ) : isLoadingBookings ? (
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
