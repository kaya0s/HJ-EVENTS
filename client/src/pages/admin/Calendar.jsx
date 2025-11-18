import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminCalendar from "../../components/admin/AdminCalendar";
import { useAuthStore } from "../../store/useAuthStore";
import { useBookingStore } from "../../store/useBookingStore";

const Calendar = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { bookings, fetchAllBookings } = useBookingStore();

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
      return;
    }
    if (bookings.length === 0) {
      fetchAllBookings();
    }
  }, [authUser, bookings.length, navigate, fetchAllBookings]);

  if (authUser?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100 lg:flex">
      <AdminSidebar />
      <main className="flex-1 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <header>
            <h1 className="text-3xl font-bold mb-2">Wedding Calendar</h1>
            <p className="text-base-content/60">
              Track upcoming weddings and supplier assignments at a glance.
            </p>
          </header>

          <AdminCalendar bookings={bookings} />
        </div>
      </main>
    </div>
  );
};

export default Calendar;
