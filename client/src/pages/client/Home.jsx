import { useRef } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import "cally";
import AvailabilityCalendar from "../../components/AvailabilityCalendar";
import Packages from "../../components/Packages";
import SupplierCarousel from "../../components/SupplierCarousel";

const Home = () => {
  const { authUser } = useAuthStore();
  const packagesRef = useRef(null);

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
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col justify-center gap-12 px-4 py-20 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-6 text-center lg:text-left">
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
        <AvailabilityCalendar />
      </div>

      <SupplierCarousel />

      <div id="packages" ref={packagesRef}>
        <Packages />
      </div>
    </section>
  );
};

export default Home;
