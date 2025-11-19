import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

// Custom hook for managing reviews state and fetching from server
export const useReviewsStore = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reviews from server
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setReviews(result.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Calculate average rating
  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return "0.0"; // Added safety check
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const submitReview = async ({ bookingId, rating, comment, reviewId }) => {
    if (!bookingId) {
      toast.error("Please select a booking to review.");
      throw new Error("Booking required");
    }
    setIsSubmitting(true);
    try {
      let response;
      if (reviewId) {
        response = await axiosInstance.put(`/reviews/${reviewId}`, {
          rating,
          comment,
        });
      } else {
        response = await axiosInstance.post("/reviews", {
          bookingId,
          rating,
          comment,
        });
      }
      await fetchReviews();
      return response.data?.data;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refetch reviews (useful for refresh)
  const refetchReviews = useCallback(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    averageRating: getAverageRating(),
    refetchReviews,
    submitReview,
    isSubmitting,
  };
};

export default useReviewsStore;
