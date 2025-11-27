import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  X,
  Calendar,
  MapPin,
  Tag,
  CheckCircle,
  Users,
  Wallet,
  MinusCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DatePickerCalendar from "./DatePickerCalendar";
import axiosInstance from "../lib/axios";
import { useSupplierStore } from "../store/useSupplierStore";
import { useDeductionStore } from "../store/useDeductionStore";
import { useAuthStore } from "../store/useAuthStore";
import { usePermissionsStore } from "../store/usePermissionsStore";

const normalizeCategoryKey = (value = "") => value.trim().toLowerCase();

const BookingModal = ({ package: pkg, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const canSubmitRequests = usePermissionsStore((state) =>
    authUser?.role === "user"
      ? state.isAllowed("user", "submitRequests")
      : false
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState({});
  const [externalSelections, setExternalSelections] = useState({});
  const [showVerification, setShowVerification] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const {
    suppliers,
    categories,
    fetchAllSuppliers,
    isLoading: isLoadingSuppliers,
  } = useSupplierStore();
  const {
    deductions,
    fetchDeductions,
    isLoading: isLoadingDeductions,
  } = useDeductionStore();

  const isRequestsDisabled = authUser?.role === "user" && !canSubmitRequests;

  // Check authentication when modal opens
  useEffect(() => {
    if (isOpen && !authUser) {
      toast.error("Please login first to book a package");
      onClose();
      navigate("/login");
      return;
    }
    if (isOpen && isRequestsDisabled) {
      toast.error("Booking requests are currently disabled by your admin.");
    }
  }, [isOpen, authUser, onClose, navigate, isRequestsDisabled]);

  // Fetch booked dates and suppliers from server
  useEffect(() => {
    if (isOpen && authUser) {
      const fetchData = async () => {
        try {
          await Promise.all([fetchAllSuppliers(), fetchDeductions()]);

          const datesResponse = await axiosInstance.get(
            "/bookings/availability?allPackages=true"
          );
          const booked = Array.isArray(datesResponse.data?.bookedDates)
            ? datesResponse.data.bookedDates.map((d) =>
                typeof d === "string" ? d : d.date
              )
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
  }, [isOpen, authUser, fetchAllSuppliers, fetchDeductions]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setTitle("");
      setVenue("");
      setSelectedSuppliers({});
      setExternalSelections({});
      setShowVerification(false);
      setShowConfirmation(false);
      setVerificationCode("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedSuppliers((prev) => {
      const conflicts = Object.entries(prev)
        .map(([category, supplierId]) => {
          if (!supplierId) return null;
          const supplier = suppliers.find((s) => s._id === supplierId);
          if (supplier?.unavailableDates?.includes(selectedDate)) {
            return { category, supplier };
          }
          return null;
        })
        .filter(Boolean);

      if (conflicts.length === 0) return prev;

      const updated = { ...prev };
      conflicts.forEach(({ category }) => {
        updated[category] = null;
      });

      toast.error(
        `${conflicts
          .map(({ supplier }) => supplier.name)
          .join(", ")} not available on ${dayjs(selectedDate).format(
          "MMM DD, YYYY"
        )}. Please choose another supplier.`
      );

      return updated;
    });
  }, [selectedDate, suppliers]);

  const getDeductionAmount = (category) => {
    const key = normalizeCategoryKey(category || "");
    return deductions[key]?.amount || 0;
  };

  const selectedExternalCategories = Object.entries(externalSelections).filter(
    ([, isUsing]) => isUsing
  );

  const totalDeduction = selectedExternalCategories.reduce(
    (sum, [category]) => sum + getDeductionAmount(category),
    0
  );

  const basePrice = Number(pkg?.price) || 0;
  const finalPrice = Math.max(0, basePrice - totalDeduction);

  const handleSupplierChange = (category, supplierId) => {
    setSelectedSuppliers((prev) => ({
      ...prev,
      [category]: supplierId || null,
    }));
    if (supplierId) {
      setExternalSelections((prev) => ({
        ...prev,
        [category]: false,
      }));
    }
  };

  const toggleExternalSupplier = (category) => {
    setExternalSelections((prev) => {
      const nextValue = !prev[category];
      if (nextValue) {
        setSelectedSuppliers((prevSuppliers) => ({
          ...prevSuppliers,
          [category]: null,
        }));
      }
      return {
        ...prev,
        [category]: nextValue,
      };
    });
  };

  const getSuppliersByCategory = (category) => {
    return suppliers.filter((s) => s.category === category);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!authUser) {
      toast.error("Please login first to book a package");
      onClose();
      navigate("/login");
      return;
    }

    // Check if user is a client
    if (authUser.role !== "user") {
      toast.error("Only clients can book packages");
      onClose();
      return;
    }

    if (isRequestsDisabled) {
      toast.error("You do not have access to submit booking requests.");
      return;
    }

    if (!canSubmitRequests) {
      toast.error("Booking requests are disabled by the administrator.");
      onClose();
      return;
    }

    if (!selectedDate) {
      toast.error("Please select an event date");
      return;
    }

    if (!venue.trim()) {
      toast.error("Please enter a venue");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a wedding title");
      return;
    }

    // Show verification step
    await handleSendVerificationCode();
  };

  const handleSendVerificationCode = async () => {
    setIsSendingCode(true);
    try {
      const supplierIds = Object.values(selectedSuppliers).filter(Boolean);
      const externalSupplierCategories = Object.entries(externalSelections)
        .filter(([, isUsing]) => isUsing)
        .map(([category]) => category);

      await axiosInstance.post("/bookings/send-verification", {
        packageId: pkg._id,
        eventDate: selectedDate,
        title: title.trim(),
        venue: venue.trim(),
        suppliers: supplierIds,
        externalSuppliers: externalSupplierCategories,
      });

      toast.success("Verification code sent to your email");
      setShowVerification(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to send verification code"
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await axiosInstance.post("/bookings/verify-code", {
        verificationCode: verificationCode.trim(),
      });

      toast.success(res.data.message || "Booking verified successfully");
      setShowVerification(false);
      setShowConfirmation(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Invalid verification code"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmBooking = async () => {
    // Booking is already created after verification, just close and refresh
    toast.success("Booking confirmed successfully!");
    onClose();
    // Refresh the page or navigate to bookings
    window.location.href = "/my-bookings";
  };

  if (!isOpen) return null;

  // Verification View
  if (showVerification) {
    return (
      <dialog open={isOpen} className="modal modal-open">
        <div className="modal-box max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-2xl mb-1">Verify Your Booking</h3>
              <p className="text-sm text-base-content/60">
                Enter the code sent to your email
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

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Verification Code
                </span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="input input-bordered w-full tracking-widest text-center text-lg"
                placeholder="••••••"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                required
                autoFocus
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Check your email for the 6-digit code
                </span>
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-base-200">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowVerification(false);
                  setVerificationCode("");
                }}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleSendVerificationCode}
                disabled={isSendingCode || isRequestsDisabled}
              >
                {isSendingCode ? "Sending..." : "Resend Code"}
              </button>
              <button
                type="submit"
                className="btn btn-primary min-w-[120px]"
                disabled={
                  !verificationCode.trim() || isVerifying || isRequestsDisabled
                }
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={onClose} aria-label="Close modal">
            close
          </button>
        </form>
      </dialog>
    );
  }

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
              <h3 className="font-bold text-2xl mb-1">Booking Confirmed!</h3>
              <p className="text-sm text-base-content/60">
                Your booking has been successfully created
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
                  <span className="text-base-content/70">Title:</span>
                  <span className="font-medium">{title}</span>
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

            {/* Pricing Summary */}
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Pricing Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Package Price</span>
                  <span>₱{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>External supplier deductions</span>
                  <span className="text-success font-medium">
                    {totalDeduction > 0
                      ? `-₱${totalDeduction.toLocaleString()}`
                      : "₱0"}
                  </span>
                </div>
                {selectedExternalCategories.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-base-content/70">
                    {selectedExternalCategories.map(([category]) => (
                      <li key={category} className="flex items-center gap-2">
                        <MinusCircle className="w-4 h-4 text-success" />
                        <span>
                          {category} ( -₱
                          {getDeductionAmount(category).toLocaleString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-base-300 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₱{finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-base-200">
              <button
                type="button"
                className="btn btn-primary min-w-[120px]"
                onClick={handleConfirmBooking}
              >
                Done
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

        {isRequestsDisabled && (
          <div className="alert alert-warning mb-4">
            <span className="font-semibold">
              You do not have access to this feature.
            </span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Wedding Title */}
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
              disabled={isRequestsDisabled}
            />
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
              disabled={isRequestsDisabled}
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
                <span className="label-text-alt text-base-content/50">
                  let admin assign
                </span>
              </div>
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
                  const unavailableForDate = selectedDate
                    ? categorySuppliers.filter((supplier) =>
                        supplier.unavailableDates?.includes(selectedDate)
                      )
                    : [];
                  const allUnavailable =
                    selectedDate &&
                    unavailableForDate.length === categorySuppliers.length;

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
                        disabled={!!externalSelections[category]}
                      >
                        <option value="">None (Admin will assign)</option>
                        {categorySuppliers.map((supplier) => {
                          const isUnavailable =
                            selectedDate &&
                            supplier.unavailableDates?.includes(selectedDate);
                          return (
                            <option
                              key={supplier._id}
                              value={supplier._id}
                              disabled={Boolean(isUnavailable)}
                            >
                              {supplier.name}
                              {supplier.rating > 0 && ` ⭐ ${supplier.rating}`}
                              {supplier.priceRange &&
                                ` - ${supplier.priceRange}`}
                              {isUnavailable ? " (Unavailable)" : ""}
                            </option>
                          );
                        })}
                      </select>
                      <label className="label cursor-pointer justify-start gap-3 mt-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={!!externalSelections[category]}
                          onChange={() => toggleExternalSupplier(category)}
                        />
                        <span className="text-sm text-base-content/80">
                          I will use my own external supplier{" "}
                          {getDeductionAmount(category) > 0 && (
                            <span className="font-semibold text-success">
                              (- ₱
                              {getDeductionAmount(category).toLocaleString()})
                            </span>
                          )}
                        </span>
                      </label>
                      {getDeductionAmount(category) === 0 && (
                        <label className="label -mt-2">
                          <span className="label-text-alt text-warning">
                            Admin has not set a deduction for this category yet.
                          </span>
                        </label>
                      )}
                      {selectedDate &&
                        unavailableForDate.length > 0 &&
                        !allUnavailable && (
                          <label className="label">
                            <span className={`label-text-alt text-warning`}>
                              {`${unavailableForDate.length} supplier${
                                unavailableForDate.length > 1 ? "s" : ""
                              } unavailable on ${dayjs(selectedDate).format(
                                "MMM DD, YYYY"
                              )}.`}
                            </span>
                          </label>
                        )}
                      {selectedDate && allUnavailable && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {`All ${category} suppliers are unavailable on ${dayjs(
                              selectedDate
                            ).format("MMM DD, YYYY")}.`}
                          </span>
                        </label>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-base-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center text-sm text-base-content/70">
              <span>Package Price</span>
              <span>₱{basePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-base-content/70">
              <span>External supplier deductions</span>
              <span
                className={
                  totalDeduction > 0 ? "text-success font-semibold" : ""
                }
              >
                {totalDeduction > 0
                  ? `-₱${totalDeduction.toLocaleString()}`
                  : "₱0"}
              </span>
            </div>
            {isLoadingDeductions && (
              <p className="text-xs text-base-content/60">
                Loading deduction settings...
              </p>
            )}
            <div className="border-t border-base-300 pt-2 flex justify-between items-center">
              <span className="text-base font-semibold text-base-content">
                Estimated total
              </span>
              <span className="text-lg font-bold text-primary">
                ₱{finalPrice.toLocaleString()}
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
              disabled={!selectedDate || !venue.trim() || !title.trim()}
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
