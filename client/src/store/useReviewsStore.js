import { useState, useEffect } from "react";

// Custom hook for managing reviews state and fetching from server
export const useReviewsStore = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reviews from server
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Extract the data array from the response
      setReviews(result.data || []); // Changed this line
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
      setReviews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  // Calculate average rating
  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return "0.0"; // Added safety check
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Refetch reviews (useful for refresh)
  const refetchReviews = () => {
    fetchReviews();
  };

  return {
    reviews,
    loading,
    error,
    averageRating: getAverageRating(),
    refetchReviews,
  };
};

export default useReviewsStore;
