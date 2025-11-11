import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Tag, CheckCircle, Users } from "lucide-react";
import toast from "react-hot-toast";
import DatePickerCalendar from "./DatePickerCalendar";
import axiosInstance from "../lib/axios";
import { useSupplierStore } from "../store/useSupplierStore";

const BookingModal = ({ package: pkg, isOpen, onClose, onBook }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventType, setEventType] = useState("Wedding");
  const [venue, setVenue] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState({}); // { category: supplierId }
  const [showConfirmation, setShowConfirmation] = useState(false);
  const {
    suppliers,
    categories,
    fetchAllSuppliers,
    isLoading: isLoadingSuppliers,
  } = useSupplierStore();

  // Fetch booked dates and suppliers from server
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          // Change: Don't use Promise.all, first fetch all suppliers, then fetch booked dates for ALL packages, not just this one.
          await fetchAllSuppliers();

          // Important fix: fetch all bookings from server (not just this package)
          // to ensure all booked dates are shown on the calendar
          const datesResponse = await axiosInstance.get("/bookings/availability?allPackages=true");
          // Assuming API returns { bookedDates: [{ date: "2024-05-10" }, ...] }
          // Normalize to array of strings for DatePickerCalendar
          const booked = Array.isArray(datesResponse.data?.bookedDates)
            ? datesResponse.data.bookedDates.map((d) => typeof d === "string" ? d : d.date)
            : [];
          setBookedDates(booked);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load data");
          setBookedDates([]);
        }
      };
      fetchData();
    }
  }, [isOpen, fetchAllSuppliers]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setEventType("Wedding");
      setVenue("");
      setSelectedSuppliers({});
      setShowConfirmation(false);
    }
  }, [isOpen]);

  const handleSupplierChange = (category, supplierId) => {
    setSelectedSuppliers((prev) => ({
      ...prev,
      [category]: supplierId || null,
    }));
  };

  const getSuppliersByCategory = (category) => {
    return suppliers.filter((s) => s.category === category);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error("Please select an event date");
      return;
    }

    if (!eventType) {
      toast.error("Please select an event type");
      return;
    }

    if (!venue.trim()) {
      toast.error("Please enter a venue");
      return;
    }

    // Show confirmation step
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    const supplierIds = Object.values(selectedSuppliers).filter(Boolean);

    await onBook({
      packageId: pkg._id,
      packageName: pkg.name,
      eventDate: selectedDate,
      eventType,
      venue: venue.trim(),
      suppliers: supplierIds,
    });

    onClose();
  };

  const handleBackFromConfirmation = () => {
    setShowConfirmation(false);
  };

  if (!isOpen) return null;

  // Confirmation View
  if (showConfirmation) {
    const selectedSupplierNames = Object.entries(selectedSuppliers)
      .filter(([, id]) => id)
      .map(([category, id]) => {
        const supplier = suppliers.find((s) => s._id === id);
        return supplier ? { category, name: supplier.name } : null;
      })
      .filter(Boolean);

    return (
      <dialog open={isOpen} className="modal modal-open">
        <div className="modal-box max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-2xl mb-1">Confirm Booking</h3>
              <p className="text-sm text-base-content/60">
                Please review your booking details
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Package Info */}
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Package</h4>
              <p className="text-primary font-medium">{pkg.name}</p>
              <p className="text-sm text-base-content/70 mt-1">
                ₱{pkg.price?.toLocaleString() || "0"}
              </p>
            </div>

            {/* Event Details */}
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Event Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-base-content/60" />
                  <span className="text-base-content/70">Type:</span>
                  <span className="font-medium">{eventType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-base-content/60" />
                  <span className="text-base-content/70">Date:</span>
                  <span className="font-medium">{selectedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-base-content/60" />
                  <span className="text-base-content/70">Venue:</span>
                  <span className="font-medium">{venue}</span>
                </div>
              </div>
            </div>

            {/* Selected Suppliers */}
            {selectedSupplierNames.length > 0 ? (
              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Selected Suppliers
                </h4>
                <div className="space-y-2">
                  {selectedSupplierNames.map(({ category, name }) => (
                    <div
                      key={`${category}-${name}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="badge badge-outline badge-sm">
                        {category}
                      </span>
                      <span className="font-medium">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-base-200 rounded-lg p-4">
                <p className="text-sm text-base-content/60">
                  No suppliers selected. You can select suppliers later or the
                  admin will assign them.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-base-200">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleBackFromConfirmation}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary min-w-[120px]"
                onClick={handleConfirmBooking}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={onClose} aria-label="Close modal">
            close
          </button>
        </form>
      </dialog>
    );
  }

  // Main Booking Form View
  return (
    <dialog open={isOpen} className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-2xl mb-1">
              Book <span className="text-primary">{pkg.name}</span>
            </h3>
            <p className="text-sm text-base-content/60">
              Select your event date, details, and preferred suppliers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Event Type Dropdown */}
          <div className="form-control w-full">
            <label className="label">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-base-content/60" />
                <span className="label-text font-medium">Event Type</span>
              </div>
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="select select-bordered w-full focus:select-primary"
              required
            >
              <option value="Wedding">Wedding</option>
              <option value="Debut">Debut</option>
            </select>
          </div>

          {/* Date Picker Calendar */}
          <div className="form-control w-full">
            <label className="label">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-base-content/60" />
                <span className="label-text font-medium">Event Date</span>
              </div>
            </label>
            <div className="scale-100 mx-auto mt-8 lg:mt-0">
              <DatePickerCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                bookedDates={bookedDates}
              />
            </div>

            {selectedDate && (
              <div className="mt-2 text-sm text-success flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Selected: {selectedDate}</span>
              </div>
            )}
          </div>

          {/* Venue Input */}
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
              placeholder="Enter event venue (e.g., Grand Ballroom, Hotel Name)"
              className="input input-bordered w-full focus:input-primary"
              required
            />
          </div>

          {/* Supplier Selection */}
          <div className="form-control w-full">
            <label className="label">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-base-content/60" />
                <span className="label-text font-medium">
                  Select Suppliers (Optional)
                </span>
              </div>
              <span className="label-text-alt text-base-content/50">
                You can select suppliers for each category or leave it for admin
                to assign
              </span>
            </label>
            <div className="space-y-4 mt-2">
              {isLoadingSuppliers ? (
                <div className="text-center py-4">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-base-content/60 text-center py-4">
                  No suppliers available
                </p>
              ) : (
                categories.map((category) => {
                  const categorySuppliers = getSuppliersByCategory(category);
                  if (categorySuppliers.length === 0) return null;

                  return (
                    <div key={category} className="form-control">
                      <label className="label py-1">
                        <span className="label-text font-medium capitalize">
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
                        <option value="">None (Admin will assign)</option>
                        {categorySuppliers.map((supplier) => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.name}
                            {supplier.rating > 0 && ` ⭐ ${supplier.rating}`}
                            {supplier.priceRange && ` - ${supplier.priceRange}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Package Info */}
          <div className="bg-base-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-base-content/70">
                Package Price
              </span>
              <span className="text-lg font-bold text-primary">
                ₱{pkg.price?.toLocaleString() || "0"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-base-200">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary min-w-[120px]"
              disabled={!selectedDate || !venue.trim()}
            >
              Book Now
            </button>
          </div>
        </form>
      </div>

      {/* Backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose} aria-label="Close modal">
          close
        </button>
      </form>
    </dialog>
  );
};

export default BookingModal;
