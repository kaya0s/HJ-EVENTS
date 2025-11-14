import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Camera,
  Music,
  Utensils,
  Flower2,
  Sparkles,
} from "lucide-react";
import axiosInstance from "../lib/axios";

// Icon mapping for different service categories
const categoryIcons = {
  Photography: Camera,
  Videography: Camera,
  Music: Music,
  Catering: Utensils,
  Florist: Flower2,
  Decoration: Sparkles,
};

const SupplierCarousel = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  // Fetch suppliers from server
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/suppliers");
        setSuppliers(response.data.suppliers || []);
      } catch {
        setSuppliers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (suppliers.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % suppliers.length);
      }, 4500);
    }
    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [suppliers.length]);

  const goTo = (index) => {
    setCurrentIndex(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % suppliers.length);
    }, 4500);
  };

  const goPrev = () =>
    goTo(currentIndex === 0 ? suppliers.length - 1 : currentIndex - 1);
  const goNext = () => goTo((currentIndex + 1) % suppliers.length);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }
  if (suppliers.length === 0) {
    return (
      <div className="text-center py-16 text-base-content/50">
        <p>No suppliers available at the moment.</p>
      </div>
    );
  }

  const current = suppliers[currentIndex];
  const CategoryIcon = categoryIcons[current?.category] || Camera;

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 md:px-10 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-base-content mb-8 text-center md:text-left">
        Our Trusted Suppliers
      </h1>
      <div className="relative rounded-xl w-full bg-base-200 shadow-md flex items-center min-h-[320px] sm:min-h-[350px] md:min-h-[400px] transition-all overflow-visible">
        {suppliers.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 md:left-6 z-10 rounded-full p-2 shadow transition hover:bg-primary/90 bg-primary text-white"
              style={{ top: "50%", transform: "translateY(-50%)" }}
              aria-label="Previous supplier"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 md:right-6 z-10 rounded-full p-2 shadow transition hover:bg-primary/90 bg-primary text-white"
              style={{ top: "50%", transform: "translateY(-50%)" }}
              aria-label="Next supplier"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </>
        )}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between w-full px-4 md:px-14 py-8 md:py-12 mx-auto">
          <div className="flex flex-col items-center min-w-[170px] md:min-w-[240px]">
            <div className="relative mb-4 rounded-2xl bg-base-100 shadow-lg overflow-hidden w-40 h-40 md:w-52 md:h-52 flex items-center justify-center">
              {current?.imageURL ? (
                <img
                  src={current.imageURL}
                  alt={current.name}
                  className="object-cover w-full h-full rounded-2xl transition"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      current.name
                    )}&background=random&size=200`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex bg-gradient-to-br from-primary to-secondary items-center justify-center text-5xl font-bold text-white">
                  {current.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="absolute -bottom-4 right-4 bg-base-200 rounded-full p-2 shadow-lg border border-base-300">
                <CategoryIcon className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 mt-2">
              <span className="uppercase text-xs tracking-wide text-base-content/60">
                {current?.category}
              </span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3 justify-center items-center md:items-start pl-0 md:pl-8 py-2">
            <h2 className="text-2xl md:text-4xl font-bold text-base-content mb-0">
              {current?.name}
            </h2>
            {current?.description && (
              <div className="text-base md:text-lg text-base-content/70 max-w-2xl text-center md:text-left line-clamp-4">
                {current.description}
              </div>
            )}
            <div className="flex items-center gap-4 mt-2">
              {!!current?.rating && (
                <span className="flex items-center gap-0.5 text-warning font-semibold text-base bg-base-300 px-2.5 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-warning text-warning mr-1 -ml-1" />
                  {Number(current.rating).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Dots */}
        {suppliers.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1">
            {suppliers.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all h-2 rounded-full ${
                  i === currentIndex
                    ? "w-8 bg-primary"
                    : "w-4 bg-base-content/20 hover:bg-primary/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierCarousel;
