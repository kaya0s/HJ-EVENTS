import { useState } from "react";
import { CheckCircle, XCircle, Eye, Loader } from "lucide-react";
import dayjs from "dayjs";
import { useBookingStore } from "../../store/useBookingStore";

const BookingsTable = ({ bookings, onViewDetails }) => {
  const { acceptBooking, rejectBooking } = useBookingStore();
  const [processingId, setProcessingId] = useState(null);

  const handleAccept = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await acceptBooking(bookingId);
    } catch {
      // Error already handled in store
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    if (!confirm("Are you sure you want to reject this booking?")) return;
    setProcessingId(bookingId);
    try {
      await rejectBooking(bookingId);
    } catch {
      // Error already handled in store
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: "badge-warning",
      Accepted: "badge-success",
      Completed: "badge-info",
      Cancelled: "badge-error",
      Rejected: "badge-error",
    };
    return (
      <span className={`badge ${statusConfig[status] || "badge-ghost"}`}>
        {status}
      </span>
    );
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-base-content/60">No bookings found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Client Name</th>
            <th>Event Date</th>
            <th>Wedding Title</th>
            <th>Status</th>
            <th>Assigned Suppliers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td className="font-mono text-sm">
                {booking._id.slice(-8).toUpperCase()}
              </td>
              <td>
                {booking.user?.fullName || booking.user?.id?.fullName || "N/A"}
              </td>
              <td>{dayjs(booking.weddingDate).format("MMM DD, YYYY")}</td>
              <td className="font-medium">
                {booking.title || "Untitled Wedding"}
              </td>
              <td>{getStatusBadge(booking.status)}</td>
              <td>
                {booking.suppliers?.length > 0 ? (
                  <span className="badge badge-ghost">
                    {booking.suppliers.length} supplier(s)
                  </span>
                ) : (
                  <span className="text-base-content/50">None</span>
                )}
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => onViewDetails(booking)}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  {booking.status === "Pending" && (
                    <>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAccept(booking._id)}
                        disabled={processingId === booking._id}
                        title="Accept"
                      >
                        {processingId === booking._id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleReject(booking._id)}
                        disabled={processingId === booking._id}
                        title="Reject"
                      >
                        {processingId === booking._id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <XCircle size={16} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingsTable;
