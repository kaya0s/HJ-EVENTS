import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Loader, Edit2, Star } from "lucide-react";
import toast from "react-hot-toast";

import { useBookingStore } from "../../store/useBookingStore";
import EditBookingModal from "../../components/EditBookingModal";
import useReviewsStore from "../../store/useReviewsStore";

const statusStyles = {
  pending: "badge-warning",
  accepted: "badge-success",
  completed: "badge-info",
  cancelled: "badge-error",
  rejected: "badge-error",
  expired: "badge-neutral",
};

const MyBookings = () => {
  const { fetchMyBookings, isLoading, cancelMyBooking, updateMyBooking } =
    useBookingStore();
  const { refetchReviews, submitReview } = useReviewsStore();
  const [bookings, setBookings] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

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

  const canReview = (booking) => booking.status?.toLowerCase() === "completed";

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewForm({
      rating: booking.review?.rating ?? 5,
      comment: booking.review?.comment ?? "",
    });
  };

  const closeReviewModal = () => {
    setReviewBooking(null);
    setReviewForm({ rating: 5, comment: "" });
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking) return;
    if (!reviewForm.comment.trim()) {
      toast.error("Please share a few words about your experience.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const existingReviewId =
        (typeof reviewBooking.review === "string" && reviewBooking.review) ||
        reviewBooking.review?._id ||
        reviewBooking.review?.reviewId;

      const result = await submitReview({
        bookingId: reviewBooking._id,
        rating: Number(reviewForm.rating) || 5,
        comment: reviewForm.comment.trim(),
        reviewId: existingReviewId,
      });
      const normalizedReview = result
        ? {
            _id: result.reviewId || existingReviewId,
            rating: result.rating ?? reviewForm.rating,
            comment: result.comment ?? reviewForm.comment,
          }
        : {
            _id: existingReviewId,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
          };

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === reviewBooking._id
            ? { ...booking, review: normalizedReview }
            : booking
        )
      );
      setReviewBooking((prev) =>
        prev ? { ...prev, review: normalizedReview } : prev
      );
      toast.success(
        existingReviewId
          ? "Your review has been updated."
          : "Thank you for reviewing HJ Wedding Events!"
      );
      refetchReviews();
      closeReviewModal();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to send review";
      toast.error(message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const reviewEligibleBookings = bookings.filter(
    (booking) => canReview(booking) && !booking.review
  );

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
                        {canReview(booking) && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => openReviewModal(booking)}
                            title={
                              booking.review
                                ? "Edit your review"
                                : "Share review about HJ Wedding Events"
                            }
                          >
                            <Star size={16} />
                            {booking.review ? (
                              <span className="ml-1 hidden lg:inline">
                                Edit Review
                              </span>
                            ) : null}
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
                    {canReview(booking) && (
                      <button
                        className="btn btn-sm btn-secondary flex-1"
                        onClick={() => openReviewModal(booking)}
                      >
                        <Star size={16} className="mr-1" />
                        {booking.review ? "Edit" : "Review"}
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

      {!isLoading && (
        <div className="w-full max-w-6xl mt-10">
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Star className="text-warning" />
                    Share Your Experience
                  </h2>
                  <p className="text-sm text-base-content/70">
                    Completed weddings appear here once the event date has
                    passed. Drop a quick review for the HJ Wedding Events team.
                  </p>
                </div>
              </div>

              {reviewEligibleBookings.length === 0 ? (
                <p className="text-sm text-base-content/60">
                  No completed bookings need a review right now. Check back
                  after your next celebration!
                </p>
              ) : (
                <div className="space-y-3">
                  {reviewEligibleBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex flex-col gap-3 rounded-lg border border-base-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-base-content">
                          {booking.title || "Untitled Wedding"}
                        </p>
                        <p className="text-sm text-base-content/60">
                          {formatDate(booking.weddingDate)}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openReviewModal(booking)}
                      >
                        <Star size={16} className="mr-1" />
                        Write Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      <EditBookingModal
        booking={editingBooking}
        isOpen={!!editingBooking}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />

      {/* Review Modal */}
      {reviewBooking && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
              <Star className="text-warning" />
              Review HJ Wedding Events
            </h3>
            <p className="text-sm text-base-content/70 mb-4">
              Tell us how we did for{" "}
              <span className="font-medium">
                {reviewBooking.title || "your event"}
              </span>
              .
            </p>
            <div className="form-control gap-4">
              <label className="label flex flex-col items-start gap-2">
                <span className="label-text font-medium">Rating</span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      rating: Math.min(
                        5,
                        Math.max(1, Number(e.target.value) || 5)
                      ),
                    }))
                  }
                  className="input input-bordered w-24"
                />
              </label>
              <label className="label flex flex-col items-start gap-2">
                <span className="label-text font-medium">Comments</span>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={4}
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={closeReviewModal}
                disabled={isSubmittingReview}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeReviewModal}>close</button>
          </form>
        </dialog>
      )}
    </section>
  );
};

export default MyBookings;
