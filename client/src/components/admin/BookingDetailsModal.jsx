import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Tag, User, FileText } from "lucide-react";
import dayjs from "dayjs";
import { useBookingStore } from "../../store/useBookingStore";
import { useSupplierStore } from "../../store/useSupplierStore";

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  const { assignSuppliers } = useBookingStore();
  const { suppliers, categories, fetchAllSuppliers } = useSupplierStore();
  const [selectedSuppliers, setSelectedSuppliers] = useState({});
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllSuppliers();
      // Initialize selected suppliers from booking
      const initial = {};
      if (booking?.suppliers) {
        booking.suppliers.forEach((supplier) => {
          if (supplier.category) {
            initial[supplier.category] = supplier._id;
          }
        });
      }
      setSelectedSuppliers(initial);
    }
  }, [isOpen, booking, fetchAllSuppliers]);

  const handleSupplierChange = (category, supplierId) => {
    setSelectedSuppliers((prev) => ({
      ...prev,
      [category]: supplierId || null,
    }));
  };

  const handleAssignSuppliers = async () => {
    if (!booking) return;

    const supplierIds = Object.values(selectedSuppliers).filter(Boolean);

    setIsAssigning(true);
    try {
      await assignSuppliers(booking._id, supplierIds);
      onClose();
    } catch {
      // Error already handled in store
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Booking Details</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Booking Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="mt-1 text-primary" size={20} />
              <div>
                <p className="text-sm text-base-content/60">Client Name</p>
                <p className="font-semibold">
                  {booking.user?.fullName ||
                    booking.user?.id?.fullName ||
                    "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="mt-1 text-primary" size={20} />
              <div>
                <p className="text-sm text-base-content/60">Wedding Title</p>
                <p className="font-semibold">
                  {booking.title || "Untitled Wedding"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-1 text-primary" size={20} />
              <div>
                <p className="text-sm text-base-content/60">Event Date</p>
                <p className="font-semibold">
                  {dayjs(booking.weddingDate).format("MMMM DD, YYYY")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-primary" size={20} />
              <div>
                <p className="text-sm text-base-content/60">Venue</p>
                <p className="font-semibold">{booking.venue || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {booking.notes && (
            <div className="flex items-start gap-3">
              <FileText className="mt-1 text-primary" size={20} />
              <div className="flex-1">
                <p className="text-sm text-base-content/60 mb-1">Notes</p>
                <p className="bg-base-200 p-3 rounded-lg">{booking.notes}</p>
              </div>
            </div>
          )}

          {/* Current Suppliers */}
          {booking.suppliers && booking.suppliers.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Current Suppliers</p>
              <div className="flex flex-wrap gap-2">
                {booking.suppliers.map((supplier) => (
                  <span
                    key={supplier._id}
                    className="badge badge-primary badge-lg"
                  >
                    {supplier.name} ({supplier.category})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Supplier Assignment */}
          <div className="divider">Assign Suppliers</div>
          <div className="space-y-4">
            {categories.map((category) => {
              const categorySuppliers = suppliers.filter(
                (s) => s.category === category
              );
              if (categorySuppliers.length === 0) return null;

              return (
                <div key={category}>
                  <label className="label">
                    <span className="label-text font-semibold capitalize">
                      {category}
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedSuppliers[category] || ""}
                    onChange={(e) =>
                      handleSupplierChange(category, e.target.value)
                    }
                  >
                    <option value="">None</option>
                    {categorySuppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}{" "}
                        {supplier.rating > 0 && `⭐ ${supplier.rating}`}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAssignSuppliers}
              disabled={isAssigning}
            >
              {isAssigning ? "Assigning..." : "Assign Suppliers"}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default BookingDetailsModal;
