import { useRef, useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import "cally";
import Packages from "../../components/Packages";
import SupplierCarousel from "../../components/SupplierCarousel";
import DatePickerCalendar from "../../components/DatePickerCalendar";
import axiosInstance from "../../lib/axios";
import { Link } from "react-router-dom";

const Home = () => {
  const { authUser } = useAuthStore();
  const packagesRef = useRef(null);
  const [bookedDates, setBookedDates] = useState([]);

  // Fetch booked dates for availability calendar
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const response = await axiosInstance.get("/bookings/availability");
        setBookedDates(response.data?.bookedDates || []);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
        setBookedDates([]);
      }
    };
    fetchBookedDates();
  }, []);

  const handleExplorePackagesClick = (e) => {
    if (authUser?.role === "user") {
      e.preventDefault();
      if (packagesRef.current) {
        packagesRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="bg-linear-to-b from-base-100/80 via-base-200/40 to-base-100/80">
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col justify-center gap-12 md:gap-16 w-full max-w-screen-2xl px-6 md:px-10 py-12 md:py-16 lg:flex-row lg:items-center">
        <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 text-center lg:text-left lg:mx-0">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
            Wedding Coordination Studio
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-base-content sm:text-5xl lg:text-6xl">
            Celebrate a love story that feels exclusively yours.
          </h1>
          <p className="text-base md:text-lg text-base-content/70 leading-relaxed">
            HJ Weddings blends heartfelt planning with refined styling to craft
            ceremonies that are rich with meaning. Let our team handle every
            timeline, supplier, and surprise so you can live every moment.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start pt-2">
            <a
              href="#packages"
              onClick={handleExplorePackagesClick}
              className="btn btn-primary btn-lg"
            >
              Explore packages
            </a>
            <Link to="/about" className="btn btn-outline btn-lg">
              About
            </Link>
          </div>
        </div>
        <div className="scale-100 mx-auto mt-8 md:mt-10 lg:mt-0">
          <DatePickerCalendar bookedDates={bookedDates} />
        </div>
      </div>

      <div className="py-8 md:py-12">
        <SupplierCarousel />
      </div>

      <div id="packages" ref={packagesRef} className="py-8 md:py-12">
        <Packages />
      </div>
    </section>
  );
};

export default Home;
