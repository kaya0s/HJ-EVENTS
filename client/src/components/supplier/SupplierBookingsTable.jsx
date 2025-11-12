import dayjs from "dayjs";
import { Eye } from "lucide-react";

const statusBadgeClass = {
  Pending: "badge-warning",
  Accepted: "badge-success",
  Completed: "badge-info",
  Cancelled: "badge-error",
};

const SupplierBookingsTable = ({ bookings = [], onViewDetails }) => {
  if (!bookings.length) {
    return (
      <div className="text-center py-12">
        <p className="text-base-content/60">No bookings assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Client</th>
            <th>Wedding Title</th>
            <th>Event Date</th>
            <th>Status</th>
            <th>Venue</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td className="font-mono text-sm">
                #{booking._id?.slice(-6).toUpperCase()}
              </td>
              <td>
                {booking.user?.fullName || booking.user?.id?.fullName || "N/A"}
              </td>
              <td className="font-medium">{booking.title || "Untitled"}</td>
              <td>{dayjs(booking.weddingDate).format("MMM DD, YYYY")}</td>
              <td>
                <span
                  className={`badge ${
                    statusBadgeClass[booking.status] || "badge-ghost"
                  }`}
                >
                  {booking.status}
                </span>
              </td>
              <td>{booking.venue || "TBD"}</td>
              <td className="text-right">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => onViewDetails?.(booking)}
                  type="button"
                  title="View booking details"
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierBookingsTable;
