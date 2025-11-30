import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  MapPin,
  Tag,
  User,
  FileText,
  Mail,
  Phone,
  Home,
  PhilippinePeso,
  Info,
} from "lucide-react";
import dayjs from "dayjs";
import { useBookingStore } from "../../store/useBookingStore";
import { useSupplierStore } from "../../store/useSupplierStore";
import toast from "react-hot-toast";

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

  const canAssign = booking?.status?.toLowerCase() === "pending";

  const handleAssignSuppliers = async () => {
    if (!canAssign) return;
    if (!booking) return;

    const supplierIds = Object.values(selectedSuppliers).filter(Boolean);

    setIsAssigning(true);
    try {
      const result = await assignSuppliers(booking._id, supplierIds);
      if (result && result._id && result.updatedAt) {
        // If the store returned a fresh booking due to a 409, update the local selection and notify admin
        if (result._id === booking._id && result.updatedAt !== booking.updatedAt) {
          const newSelection = {};
          (result.suppliers || []).forEach((s) => {
            if (s.category) newSelection[s.category] = s._id;
          });
          setSelectedSuppliers(newSelection);
          // Show a message to admin that the booking was updated by someone else
          toast?.success?.('Booking updated by someone else; refreshed suppliers. Please re-assign if needed.');
        }
      }
      onClose();
    } catch (err) {
      // Error already handled in store; if we receive a fresh booking, we updated the UI above
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
            <div className="flex items-start gap-3">
              <Mail className="mt-1 text-primary" size={20} />
              <div>
                <p className="text-sm text-base-content/60">Client Email</p>
                <p className="font-semibold break-all">
                  {booking.user?.email ||
                    booking.user?.id?.email ||
                    "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 text-primary" size={20} />
              <div>
                <p className="text-sm text-base-content/60">Contact Number</p>
                <p className="font-semibold">
                  {booking.user?.phone ||
                    booking.user?.id?.phone ||
                    "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Home className="mt-1 text-primary" size={20} />
              <div>
                <p className="text-sm text-base-content/60">Client Address</p>
                <p className="font-semibold">
                  {booking.user?.address ||
                    booking.user?.id?.address ||
                    "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-base-200 rounded-xl p-4">
            <div>
              <p className="text-sm text-base-content/60 flex items-center gap-2">
                <PhilippinePeso size={18} className="text-primary" />
                Base Price
              </p>
              <p className="text-xl font-semibold">
                ₱{Number(booking.basePrice || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60 flex items-center gap-2">
                <PhilippinePeso size={18} className="text-primary" />
                Adjusted Total
              </p>
              <p className="text-xl font-semibold">
                ₱{Number(booking.totalPrice || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60 flex items-center gap-2">
                <Info size={18} className="text-primary" />
                Status
              </p>
              <p className="text-xl font-semibold capitalize">
                  {booking.status}
                </p>
                {booking.updatedAt && (
                  <p className="text-xs text-base-content/50 mt-1 ml-2">
                    Updated {dayjs(booking.updatedAt).format("MMM D, YYYY h:mm A")}
                  </p>
                )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-base-200 rounded-xl p-4">
            <div>
              <p className="text-sm text-base-content/60">Payment Status</p>
              <p className="text-xl font-semibold">
                {booking.payment?.status || 'pending'}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Transaction</p>
              <p className="text-xs font-mono break-words">
                {booking.payment?.transactionId || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Payer</p>
              <p className="font-semibold">{booking.payment?.payer?.email || 'N/A'}</p>
            </div>
          </div>

          {booking.externalSupplierSelections?.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">
                External Supplier Deductions
              </p>
              <div className="space-y-2">
                {booking.externalSupplierSelections.map((entry) => (
                  <div
                    key={`${entry.category}-${entry.deductionAmount}`}
                    className="flex items-center justify-between rounded-lg border border-base-300 px-4 py-2"
                  >
                    <span className="capitalize">{entry.category}</span>
                    <span className="font-semibold text-success">
                      -₱{Number(entry.deductionAmount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-base-content/70">
            <div>
              <p className="font-semibold">Created At</p>
              <p>
                {dayjs(booking.createdAt).format("MMMM DD, YYYY hh:mm A") ||
                  "N/A"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Last Updated</p>
              <p>
                {dayjs(booking.updatedAt).format("MMMM DD, YYYY hh:mm A") ||
                  "N/A"}
              </p>
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
                    disabled={!canAssign}
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
              disabled={isAssigning || !canAssign}
              title={!canAssign && 'Booking must be pending to assign suppliers'}
            >
              {isAssigning ? "Assigning..." : "Assign Suppliers"}
            </button>
            {!canAssign && (
              <p className="text-sm text-base-content/60">Only pending bookings can have suppliers assigned.</p>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default BookingDetailsModal;
