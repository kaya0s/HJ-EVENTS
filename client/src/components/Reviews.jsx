import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useReviewsStore } from "../store/useReviewsStore";

const Reviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch reviews from store
  const { reviews, loading, error } = useReviewsStore();

  useEffect(() => {
    if (reviews.length === 0) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, reviews.length]);

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handlePrev = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const goToSlide = (index) => {
    if (!isAnimating && index !== currentIndex) {
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  // Show loading state
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4 py-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-base text-base-content/60">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center space-y-3 py-20">
          <div className="text-error text-4xl">⚠️</div>
          <p className="text-lg font-semibold text-base-content">
            Error loading reviews
          </p>
          <p className="text-sm text-base-content/60">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!reviews || reviews.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center space-y-3 py-20">
          <div className="text-5xl opacity-40">📝</div>
          <p className="text-base text-base-content/60">
            No reviews available yet
          </p>
        </div>
      </div>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 fill-primary" />
            {avgRating} out of 5
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-base-content">
            What Our Couples Say
          </h1>
          <p className="text-base text-base-content/60 max-w-lg mx-auto">
            Real stories from real weddings we've coordinated
          </p>
        </div>

        {/* Review Card */}
        <div className="relative">
          <div
            key={currentReview.id}
            className={`bg-base-200 rounded-2xl p-8 md:p-10 transition-opacity duration-300 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            {/* Stars */}
            <div className="flex gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`relative w-6 h-6 ${
                    i < currentReview.rating ? "" : "opacity-30"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-full h-full ${
                      i < currentReview.rating
                        ? "fill-amber-400 drop-shadow-sm"
                        : "fill-base-300"
                    }`}
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
              ))}
            </div>

            {/* Review Text */}
            <p className="text-lg md:text-xl text-base-content leading-relaxed mb-8">
              "{currentReview.comment}"
            </p>

            {/* Reviewer */}
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  <img src={currentReview.avatar} alt={currentReview.name} />
                </div>
              </div>
              <div>
                <p className="font-semibold text-base-content">
                  {currentReview.name}
                </p>
                <p className="text-sm text-base-content/50">Wedding Client</p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 btn btn-circle btn-sm md:btn-md bg-base-100 hover:bg-base-200 border border-base-300"
            disabled={isAnimating}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 btn btn-circle btn-sm md:btn-md bg-base-100 hover:bg-base-200 border border-base-300"
            disabled={isAnimating}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {reviews.map((review, index) => (
            <button
              key={review.id}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-8 h-2 bg-primary"
                  : "w-2 h-2 bg-base-300 hover:bg-base-content/30"
              }`}
              disabled={isAnimating}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-base-300">
          <div className="text-center">
            <div className="text-3xl font-bold text-base-content">150+</div>
            <p className="text-sm text-base-content/60 mt-1">
              Weddings Coordinated
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-base-content">
              {avgRating}★
            </div>
            <p className="text-sm text-base-content/60 mt-1">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-base-content">100%</div>
            <p className="text-sm text-base-content/60 mt-1">Happy Couples</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
