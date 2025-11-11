import { useEffect, useState } from "react";
import { useBookingStore } from "../../store/useBookingStore";
import dayjs from "dayjs";
import { Loader } from "lucide-react";

const statusStyles = {
  Accepted: "badge-success",
  Pending: "badge-warning",
  Completed: "badge-info",
  Cancelled: "badge-error",
};

const MyBookings = () => {
  const { fetchMyBookings, isLoading } = useBookingStore();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadBookings = async () => {
      const data = await fetchMyBookings();
      setBookings(data);
    };
    loadBookings();
  }, [fetchMyBookings]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return dayjs(date).format("MMMM DD, YYYY");
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`badge ${statusStyles[status] || "badge-ghost"}`}>
        {status}
      </span>
    );
  };

  return (
    <section className="container mx-auto px-4 py-16 space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
            Your Weddings
          </p>
          <h1 className="text-3xl font-bold text-base-content">My Bookings</h1>
          <p className="text-base text-base-content/70">
            Track timelines, packages, and milestones for each celebration.
          </p>
        </div>
        <button type="button" className="btn btn-primary">
          Plan a new event
        </button>
      </header>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader className="animate-spin mx-auto" size={32} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/60">No bookings found</p>
          <p className="text-sm text-base-content/50 mt-2">
            Start by creating a new booking
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-lg">
          <table className="hidden min-w-full table-fixed text-left text-sm md:table">
            <thead className="bg-base-200 text-xs uppercase text-base-content/60">
              <tr>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Event Date</th>
                <th className="px-6 py-4 font-semibold">Event Type</th>
                <th className="px-6 py-4 font-semibold">Venue</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-base-200/40">
                  <td className="px-6 py-4 font-medium text-base-content font-mono text-sm">
                    {booking._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-base-content/70">
                    {formatDate(booking.weddingDate)}
                  </td>
                  <td className="px-6 py-4 text-base-content/70">
                    <span className="badge badge-outline">
                      {booking.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-base-content/70">
                    {booking.venue || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-4 p-6 md:hidden">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="space-y-2 rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-base-content">
                    {booking.eventType}
                  </p>
                  {getStatusBadge(booking.status)}
                </div>
                <p className="text-xs uppercase tracking-wide text-base-content/50 font-mono">
                  {booking._id.slice(-8).toUpperCase()}
                </p>
                <div className="space-y-1 text-sm text-base-content/70">
                  <p>
                    <span className="font-medium text-base-content">
                      Event date:
                    </span>{" "}
                    {formatDate(booking.weddingDate)}
                  </p>
                  <p>
                    <span className="font-medium text-base-content">
                      Venue:
                    </span>{" "}
                    {booking.venue || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default MyBookings;
