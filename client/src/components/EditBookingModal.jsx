import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Tag, Users } from "lucide-react";
import dayjs from "dayjs";
import axiosInstance from "../lib/axios";

const EditBookingModal = ({ booking, isOpen, onClose, onSave, isSaving }) => {
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  useEffect(() => {
    if (isOpen && booking) {
      setTitle(booking.title || "");
      setVenue(booking.venue || "");
      setWeddingDate(
        booking.weddingDate
          ? dayjs(booking.weddingDate).format("YYYY-MM-DD")
          : ""
      );
      setSelectedPackage(booking.package?._id || booking.package || "");
      setSelectedSuppliers(booking.suppliers?.map((s) => s._id || s) || []);

      axiosInstance.get("/packages").then((res) =>
        setPackages(res.data.packages || [])
      );
      axiosInstance.get("/suppliers").then((res) =>
        setSuppliers(res.data.suppliers || [])
      );
    }
  }, [isOpen, booking]);

  const canEdit = booking?.status?.toLowerCase() === 'pending';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canEdit) {
      // Prevent accidental submits when booking is not editable
      return;
    }
    onSave({
      title: title.trim(),
      venue: venue.trim(),
      weddingDate,
      ...(canEdit && {
        packageId: selectedPackage,
        suppliers: selectedSuppliers,
      }),
      lastKnownUpdatedAt: booking.updatedAt,
    });
  };

  const formatSuppliers = (suppliers) => {
    if (!suppliers || suppliers.length === 0) {
      return (
        <p className="text-sm text-base-content/60 italic">
          No suppliers assigned yet
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {suppliers.map((supplier) => (
          <div
            key={supplier._id || supplier}
            className="flex items-center justify-between bg-base-200 rounded-lg p-3"
          >
            <div className="flex-1">
              <p className="font-medium text-base-content">
                {supplier.name || supplier}
              </p>
              {supplier.category && (
                <p className="text-sm text-base-content/60 capitalize">
                  {supplier.category}
                </p>
              )}
            </div>
            {/* rating removed */}
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen || !booking) return null;

  return (
    <dialog open={isOpen} className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-2xl mb-1">Edit Booking</h3>
            <p className="text-sm text-base-content/60">
              Update your booking details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Close modal"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking ID */}
          <div className="bg-base-200 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-base-content/50 font-mono mb-1">
              Booking ID
            </p>
            <p className="font-semibold text-lg">
              {booking._id.slice(-8).toUpperCase()}
            </p>
          </div>

          {/* Event Date */}
          <div className="form-control w-full">
            <label className="label">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-base-content/60" />
                <span className="label-text font-medium">Event Date</span>
              </div>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={weddingDate}
              min={dayjs().add(1, "day").format("YYYY-MM-DD")}
              onChange={(e) => setWeddingDate(e.target.value)}
              disabled={isSaving}
              required
            />
          </div>

          {/* Wedding Title - Editable */}
          <div className="form-control w-full">
            <label className="label">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-base-content/60" />
                <span className="label-text font-medium">Wedding Title</span>
              </div>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title (e.g., John & Jane's Celebration)"
              className="input input-bordered w-full focus:input-primary"
              maxLength={120}
              required
              disabled={isSaving}
            />
          </div>

          {/* Venue - Editable */}
          <div className="form-control w-full">
            <label className="label">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-base-content/60" />
                <span className="label-text font-medium">Venue</span>
              </div>
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Enter venue address"
              className="input input-bordered w-full focus:input-primary"
              required
              disabled={isSaving}
            />
          </div>

          {/* Package Selector (editable for pending) */}
          {canEdit ? (
            <div className="form-control w-full">
              <label className="label">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-base-content/60" />
                  <span className="label-text font-medium">Package</span>
                </div>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                disabled={isSaving}
              >
                <option value="">Select a package</option>
                {packages.map((pkg) => (
                  <option key={pkg._id} value={pkg._id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            booking.package && (
              <div className="bg-base-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-base-content/50 font-mono mb-1">
                  Package
                </p>
                <p className="font-semibold text-lg">
                  {booking.package.name || "N/A"}
                </p>
              </div>
            )
          )}

          {/* Suppliers — editable for pending, read-only otherwise */}
          <div className="form-control w-full">
            <label className="label">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-base-content/60" />
                <span className="label-text font-medium">
                  Assigned Suppliers
                </span>
                {!canEdit && (
                  <span className="text-xs text-base-content/50">
                    (Assigned by admin)
                  </span>
                )}
              </div>
            </label>
            {canEdit ? (
              <div className="bg-base-100 border border-base-300 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                {suppliers.length === 0 ? (
                  <p className="text-sm text-base-content/60 italic">
                    No suppliers available
                  </p>
                ) : (
                  suppliers.map((supplier) => (
                    <label
                      key={supplier._id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={selectedSuppliers.includes(supplier._id)}
                        disabled={isSaving}
                        onChange={(e) => {
                          setSelectedSuppliers((prev) =>
                            e.target.checked
                              ? [...prev, supplier._id]
                              : prev.filter((id) => id !== supplier._id)
                          );
                        }}
                      />
                      <span className="text-sm">
                        {supplier.name}
                        {supplier.category && (
                          <span className="text-base-content/50 capitalize">
                            {" "}
                            — {supplier.category}
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                {formatSuppliers(booking.suppliers)}
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">Status:</span>
            <span
              className={`badge ${
                booking.status?.toLowerCase() === "pending"
                  ? "badge-warning"
                  : booking.status?.toLowerCase() === "accepted"
                  ? "badge-success"
                  : booking.status?.toLowerCase() === "completed"
                  ? "badge-info"
                  : "badge-error"
              }`}
            >
              {booking.status?.charAt(0).toUpperCase() +
                booking.status?.slice(1).toLowerCase() || booking.status}
            </span>
            {booking.updatedAt && (
              <span className="text-xs text-base-content/50 ml-2">
                Updated {dayjs(booking.updatedAt).format("MMM D, YYYY h:mm A")}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || !title.trim() || !venue.trim() || !weddingDate || !canEdit}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            {!canEdit && (
              <p className="text-sm text-base-content/60">
                Booking cannot be edited unless it is pending.
              </p>
            )}
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          disabled={isSaving}
        >
          close
        </button>
      </form>
    </dialog>
  );
};

export default EditBookingModal;
