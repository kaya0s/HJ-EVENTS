import { useRef, useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import "cally";
import Packages from "../../components/Packages";
import SupplierCarousel from "../../components/SupplierCarousel";
import DatePickerCalendar from "../../components/DatePickerCalendar";
import axiosInstance from "../../lib/axios";

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
    <section className="bg-linear-to-b from-base-100 via-base-200/60 to-base-100">
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col justify-center gap-12 w-full max-w-screen-2xl px-2 md:px-10 py-10 lg:flex-row lg:items-center">
        <div className="max-w-2xl mx-auto space-y-6 text-center lg:text-left lg:mx-0">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
            Wedding Coordination Studio
          </p>
          <h1 className="text-4xl font-bold text-base-content sm:text-5xl lg:text-6xl">
            Celebrate a love story that feels exclusively yours.
          </h1>
          <p className="text-lg text-base-content/70">
            HJ Weddings blends heartfelt planning with refined styling to craft
            ceremonies that are rich with meaning. Let our team handle every
            timeline, supplier, and surprise so you can live every moment.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#packages"
              onClick={handleExplorePackagesClick}
              className="btn btn-primary btn-lg"
            >
              Explore packages
            </a>
            <a
              href={authUser?.role === "user" ? "/about" : "/"}
              className="btn btn-outline btn-lg"
            >
              About us
            </a>
          </div>
        </div>
        <div className="scale-100 mx-auto mt-8 lg:mt-0">
          <DatePickerCalendar bookedDates={bookedDates} />
        </div>
      </div>

      <SupplierCarousel />

      <div id="packages" ref={packagesRef}>
        <Packages />
      </div>
    </section>
  );
};

export default Home;
