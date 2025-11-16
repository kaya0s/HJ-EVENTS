import { useEffect, useState } from "react";
import { useBookingStore } from "../../store/useBookingStore";
import dayjs from "dayjs";
import { Loader, Edit2 } from "lucide-react";
import EditBookingModal from "../../components/EditBookingModal";

const statusStyles = {
  pending: "badge-warning",
  accepted: "badge-success",
  completed: "badge-info",
  cancelled: "badge-error",
  rejected: "badge-error",
};

const MyBookings = () => {
  const { fetchMyBookings, isLoading, cancelMyBooking, updateMyBooking } =
    useBookingStore();
  const [bookings, setBookings] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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
    const normalizedStatus = status?.toLowerCase() || status;
    const displayStatus =
      status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() ||
      status;
    return (
      <span
        className={`badge ${statusStyles[normalizedStatus] || "badge-ghost"}`}
      >
        {displayStatus}
      </span>
    );
  };

  const isPending = (status) => {
    const normalized = status?.toLowerCase();
    return normalized === "pending";
  };

  const canEdit = (status) => {
    const normalized = status?.toLowerCase();
    return normalized === "pending";
  };

  const handleCancel = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      const updated = await cancelMyBooking(bookingId);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: updated?.status || "cancelled" }
            : booking
        )
      );
    } catch {
      // toast handled in store
    } finally {
      setCancellingId(null);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
  };

  const handleCloseEdit = () => {
    setEditingBooking(null);
  };

  const handleSaveEdit = async (formData) => {
    if (!editingBooking) return;
    setIsSaving(true);
    try {
      const updated = await updateMyBooking(editingBooking._id, formData);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === editingBooking._id
            ? { ...booking, ...updated }
            : booking
        )
      );
      setEditingBooking(null);
    } catch {
      // toast handled in store
    } finally {
      setIsSaving(false);
    }
  };

  const formatSuppliers = (suppliers) => {
    if (!suppliers || suppliers.length === 0) return "None assigned";
    if (Array.isArray(suppliers)) {
      return suppliers.map((s) => s.name || s).join(", ");
    }
    return "None assigned";
  };

  return (
    <section className="bg-linear-to-b from-base-100/80 via-base-200/40 to-base-100/80 min-h-screen w-full px-4 pt-6 pb-16 flex flex-col items-center">
      <header className="w-full max-w-6xl flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
            Your Weddings
          </p>
          <h1 className="text-3xl font-bold text-base-content">My Bookings</h1>
          <p className="text-base text-base-content/70">
            Track timelines, packages, and milestones for each celebration.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary self-start md:self-auto mt-4 md:mt-0"
        >
          Plan a new event
        </button>
      </header>

      <div className="w-full max-w-6xl">
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
          <div className="overflow-x-auto rounded-3xl border border-base-300 bg-base-100 shadow-lg">
            <table className="hidden min-w-full table-fixed text-left text-sm md:table">
              <thead className="bg-base-200 text-xs uppercase text-base-content/60">
                <tr>
                  <th className="px-6 py-4 font-semibold">Booking ID</th>
                  <th className="px-6 py-4 font-semibold">Event Date</th>
                  <th className="px-6 py-4 font-semibold">Wedding Title</th>
                  <th className="px-6 py-4 font-semibold">Venue</th>
                  <th className="px-6 py-4 font-semibold">
                    Assigned Suppliers
                  </th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
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
                      {booking.title || "Untitled Wedding"}
                    </td>
                    <td className="px-6 py-4 text-base-content/70">
                      {booking.venue || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-base-content/70 text-sm">
                      {formatSuppliers(booking.suppliers)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {canEdit(booking.status) && (
                          <button
                            className="btn btn-sm btn-outline btn-primary"
                            onClick={() => handleEdit(booking)}
                            title="Edit Booking"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {isPending(booking.status) && (
                          <button
                            className="btn btn-sm btn-outline btn-error"
                            onClick={() => handleCancel(booking._id)}
                            disabled={cancellingId === booking._id}
                            title="Cancel Booking"
                          >
                            {cancellingId === booking._id ? (
                              <Loader className="animate-spin" size={16} />
                            ) : (
                              "Cancel"
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-4 p-4 md:hidden">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="space-y-2 rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-base-content">
                        {booking.title || "Untitled Wedding"}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-base-content/50 font-mono">
                        {booking._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="ml-4">{getStatusBadge(booking.status)}</div>
                  </div>
                  <div className="space-y-1 text-sm text-base-content/70 mt-2">
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
                    <p>
                      <span className="font-medium text-base-content">
                        Suppliers:
                      </span>{" "}
                      {formatSuppliers(booking.suppliers)}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3 justify-end">
                    {canEdit(booking.status) && (
                      <button
                        className="btn btn-sm btn-outline btn-primary flex-1"
                        onClick={() => handleEdit(booking)}
                      >
                        <Edit2 size={16} className="mr-1" />
                        Edit
                      </button>
                    )}
                    {isPending(booking.status) && (
                      <button
                        className="btn btn-sm btn-outline btn-error flex-1"
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancellingId === booking._id}
                      >
                        {cancellingId === booking._id ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Booking Modal */}
      <EditBookingModal
        booking={editingBooking}
        isOpen={!!editingBooking}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />
    </section>
  );
};

export default MyBookings;
