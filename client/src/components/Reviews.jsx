import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, Loader2 } from "lucide-react";
import { useReviewsStore } from "../store/useReviewsStore";

const Reviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch reviews from store
  const { reviews, loading, error, averageRating } = useReviewsStore();

  const gradients = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-rose-500 to-pink-500",
    "from-teal-500 to-green-500",
    "from-amber-500 to-orange-500",
  ];

  const getRandomGradient = () => {
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  useEffect(() => {
    if (reviews.length === 0) return; // Don't start timer if no reviews

    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, reviews.length]); // ✅ Add reviews.length

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handlePrev = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const goToSlide = (index) => {
    if (!isAnimating && index !== currentIndex) {
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const getVisibleReviews = () => {
    const visible = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + reviews.length) % reviews.length;
      visible.push({ ...reviews[index], position: i });
    }
    return visible;
  };

  const avgRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1);

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen bg-linear-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
          <p className="text-xl text-base-content/70">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-linear-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-error text-5xl">⚠️</div>
          <p className="text-xl font-bold text-base-content">
            Error loading reviews
          </p>
          <p className="text-base-content/70">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!reviews || reviews.length === 0) {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center rounded-lg">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl opacity-50">📝</div>
          <p className="text-xl text-base-content/70">
            No reviews available yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-linear-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-7xl w-full h-full flex flex-col justify-center">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-block">
            <div className="badge badge-primary badge-lg gap-2 px-6 py-3 text-sm font-semibold">
              ⭐ Rated {avgRating} out of 5
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Loved by our clients
          </h1>
          <p className="text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto">
            See what our amazing community has to say about their experience
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative h-[400px] mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            {getVisibleReviews().map((review) => {
              const scale = review.position === 0 ? "scale-100" : "scale-75";
              const opacity =
                review.position === 0 ? "opacity-100" : "opacity-30";
              const zIndex = review.position === 0 ? "z-30" : "z-10";
              const blur = review.position === 0 ? "" : "blur-sm";
              const translate =
                review.position === -1
                  ? "-translate-x-[70%]"
                  : review.position === 1
                  ? "translate-x-[70%]"
                  : "";

              return (
                <div
                  key={`${review.id}-${review.position}`}
                  className={`absolute w-full max-w-2xl transition-all duration-500 ease-out ${scale} ${opacity} ${zIndex} ${blur} ${translate} ${
                    isAnimating ? "pointer-events-none" : ""
                  }`}
                >
                  <div className="card bg-base-100 shadow-2xl border border-base-300 backdrop-blur-sm">
                    <div className="card-body p-8 md:p-12">
                      {/* Quote Icon */}
                      <div
                        className={`w-16 h-16 rounded-2xl bg-linear-to-br ${getRandomGradient()} flex items-center justify-center mb-6 transform -rotate-6`}
                      >
                        <Quote
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                        />
                      </div>

                      {/* Rating Stars */}
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${
                              i < review.rating
                                ? "text-warning fill-warning"
                                : "text-base-300"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="text-xl md:text-2xl text-base-content leading-relaxed mb-8 font-medium">
                        "{review.comment}"
                      </p>

                      {/* Reviewer Info */}
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={review.avatar} alt={review.name} />
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-lg text-base-content">
                            {review.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="btn btn-circle btn-primary absolute left-4 top-1/2 -translate-y-1/2 z-40 shadow-lg"
            disabled={isAnimating}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="btn btn-circle btn-primary absolute right-4 top-1/2 -translate-y-1/2 z-40 shadow-lg"
            disabled={isAnimating}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        {/* Dots Indicator */}
        <div className="flex justify-center gap-3">
          {reviews.map((review, index) => (
            <button
              key={review.id} // ✅ Using unique id instead of index
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-12 h-3 bg-primary"
                  : "w-3 h-3 bg-base-300 hover:bg-base-content/30"
              }`}
              disabled={isAnimating}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              15k+
            </div>
            <p className="text-base-content/70 mt-1 text-sm">Happy Users</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-secondary to-accent bg-clip-text text-transparent">
              {avgRating}★
            </div>
            <p className="text-base-content/70 mt-1 text-sm">{averageRating}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-accent to-primary bg-clip-text text-transparent">
              99%
            </div>
            <p className="text-base-content/70 mt-1 text-sm">Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
