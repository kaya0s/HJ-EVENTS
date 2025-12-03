import { useState } from "react";
import { CheckCircle, XCircle, Eye, Loader, BadgeCheck } from "lucide-react";
import dayjs from "dayjs";
import { useBookingStore } from "../../store/useBookingStore";
import { confirmDialog } from "../../utils/confirmDialog";

const BookingsTable = ({ bookings, onViewDetails }) => {
  const { acceptBooking, rejectBooking, completeBooking } = useBookingStore();
  const [processingId, setProcessingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  const handleAccept = async (booking) => {
    const bookingId = booking._id;
    const bookingIdShort = bookingId.slice(-8).toUpperCase();
    const userName =
      booking.user?.fullName || booking.user?.id?.fullName || "N/A";
    const eventDate = dayjs(booking.weddingDate).format("MMMM DD, YYYY");

    const confirmed = await confirmDialog({
      title: "Accept Booking",
      html: `
        <div class="text-left space-y-3">
          <p class="text-base">Are you sure you want to accept this booking?</p>
          <div class="bg-base-200 rounded-lg p-4 space-y-2">
            <div class="flex justify-between">
              <span class="font-semibold">Booking ID:</span>
              <span class="font-mono text-sm">${bookingIdShort}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">User Name:</span>
              <span>${userName}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">Event Date:</span>
              <span>${eventDate}</span>
            </div>
          </div>
        </div>
      `,
      confirmText: "Accept",
      cancelText: "Cancel",
      confirmButtonClass: "btn-success",
      cancelButtonClass: "btn-outline",
      icon: "question",
    });

    if (!confirmed) return;

    setProcessingId(bookingId);
    try {
      await acceptBooking(bookingId);
    } catch {
      // Error already handled in store
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (booking) => {
    const bookingId = booking._id;
    const bookingIdShort = bookingId.slice(-8).toUpperCase();
    const userName =
      booking.user?.fullName || booking.user?.id?.fullName || "N/A";
    const eventDate = dayjs(booking.weddingDate).format("MMMM DD, YYYY");

    const confirmed = await confirmDialog({
      title: "Reject Booking",
      html: `
        <div class="text-left space-y-3">
          <p class="text-base">Are you sure you want to reject this booking?</p>
          <div class="bg-base-200 rounded-lg p-4 space-y-2">
            <div class="flex justify-between">
              <span class="font-semibold">Booking ID:</span>
              <span class="font-mono text-sm">${bookingIdShort}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">User Name:</span>
              <span>${userName}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">Event Date:</span>
              <span>${eventDate}</span>
            </div>
          </div>
        </div>
      `,
      confirmText: "Reject",
      cancelText: "Cancel",
      confirmButtonClass: "btn-error",
      cancelButtonClass: "btn-outline",
      icon: "warning",
    });

    if (!confirmed) return;

    setProcessingId(bookingId);
    try {
      await rejectBooking(bookingId);
    } catch {
      // Error already handled in store
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (bookingId) => {
    setCompletingId(bookingId);
    try {
      await completeBooking(bookingId);
    } catch {
      // toast handled in store
    } finally {
      setCompletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase() || status;
    const statusConfig = {
      pending: "badge-warning",
      accepted: "badge-success",
      completed: "badge-info",
      cancelled: "badge-error",
      rejected: "badge-error",
      expired: "badge-neutral",
    };
    const displayStatus =
      status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() ||
      status;
    return (
      <span
        className={`badge ${statusConfig[normalizedStatus] || "badge-ghost"}`}
      >
        {displayStatus}
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
              <td>
                <div className="flex items-center gap-2">
                  {getStatusBadge(booking.status)}
                  {booking.payment?.status === "paid" && (
                    <span className="badge badge-success">Paid</span>
                  )}
                </div>
              </td>
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
                  {(booking.status === "pending" ||
                    booking.status === "Pending") && (
                    <>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAccept(booking)}
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
                        onClick={() => handleReject(booking)}
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
                  {(booking.status === "accepted" ||
                    booking.status === "Accepted") && (
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleComplete(booking._id)}
                      disabled={
                        completingId === booking._id ||
                        processingId === booking._id
                      }
                      title="Mark as completed"
                    >
                      {completingId === booking._id ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <BadgeCheck size={16} />
                      )}
                    </button>
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
