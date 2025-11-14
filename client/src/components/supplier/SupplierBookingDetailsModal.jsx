import dayjs from "dayjs";
import { X, Calendar, MapPin, Tag, User, FileText } from "lucide-react";

const SupplierBookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Booking Details</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
            type="button"
            aria-label="Close booking details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
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
                  {booking.weddingDate
                    ? dayjs(booking.weddingDate).format("MMMM DD, YYYY")
                    : "TBD"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-primary" size={20} />
              <div>
                <p className="text-sm text-base-content/60">Venue</p>
                <p className="font-semibold">{booking.venue || "TBD"}</p>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="flex items-start gap-3">
              <FileText className="mt-1 text-primary" size={20} />
              <div className="flex-1">
                <p className="text-sm text-base-content/60 mb-1">Notes</p>
                <p className="bg-base-200 p-3 rounded-lg leading-relaxed">
                  {booking.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} role="presentation" />
    </div>
  );
};

export default SupplierBookingDetailsModal;
