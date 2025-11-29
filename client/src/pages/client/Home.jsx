import { useRef, useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import "cally";
import Packages from "../../components/Packages";
import SupplierCarousel from "../../components/SupplierCarousel";
import DatePickerCalendar from "../../components/DatePickerCalendar";
import axiosInstance from "../../lib/axios";
import { Link } from "react-router-dom";
import Reviews from "../../components/Reviews";
import useFaqStore from "../../store/useFaqStore";
import useReviewsStore from "../../store/useReviewsStore";

const Home = () => {
  const { authUser } = useAuthStore();
  const packagesRef = useRef(null);
  const [bookedDates, setBookedDates] = useState([]);
  const { faqs, isLoading: isLoadingFaqs, fetchFaqs } = useFaqStore();
  const { refetchReviews } = useReviewsStore();

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
    fetchFaqs();
    refetchReviews();
  }, [fetchFaqs, refetchReviews]);

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

      {/* HERO SECTION */}
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

      {/* STATIC DETAILS SECTION */}
      <section className="py-14">
        <div className="container mx-auto w-full max-w-screen-2xl px-6 md:px-10 text-center space-y-10">

          <p className="text-sm font-semibold text-primary uppercase tracking-[0.3em]">
            What We Offer
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-base-content max-w-3xl mx-auto">
            A seamless experience from planning to “I do”
          </h2>

          <div className="grid gap-10 md:grid-cols-3 mt-10">

            <div className="bg-base-200/60 p-6 rounded-xl shadow-sm border border-base-300/20 space-y-3">
              <h3 className="font-semibold text-lg">Full-Service Coordination</h3>
              <p className="text-base-content/70 text-sm leading-relaxed">
                From timelines to rehearsals, our team manages every detail
                so your wedding day flows without stress or interruptions.
              </p>
            </div>

            <div className="bg-base-200/60 p-6 rounded-xl shadow-sm border border-base-300/20 space-y-3">
              <h3 className="font-semibold text-lg">Supplier Management</h3>
              <p className="text-base-content/70 text-sm leading-relaxed">
                We partner with trusted florists, photographers, caterers,
                and creatives to ensure your vision is perfectly executed.
              </p>
            </div>

            <div className="bg-base-200/60 p-6 rounded-xl shadow-sm border border-base-300/20 space-y-3">
              <h3 className="font-semibold text-lg">Custom Styling & Design</h3>
              <p className="text-base-content/70 text-sm leading-relaxed">
                Elegant setups, curated colors, and thoughtful details tailored
                to match your unique story and aesthetic preferences.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <div id="packages" ref={packagesRef} className="py-8 md:py-12">
        <Packages />
      </div>

      {/* SUPPLIERS */}
      <div className="pb-8 md:pb-12">
        <SupplierCarousel />
      </div>

      {/* REVIEWS */}
      <div>
        <div className="container mx-auto w-full max-w-screen-2xl px-6 md:px-10 py-10 space-y-8">
          <Reviews />
        </div>
      </div>

      {/* FAQ */}
      <section className="py-12">
        <div className="container mx-auto w-full max-w-screen-2xl px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.3em]">
                FAQs
              </p>
              <h2 className="text-3xl font-bold text-base-content mt-2">
                Frequently asked questions
              </h2>
            </div>
          </div>

          {isLoadingFaqs ? (
            <div className="text-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : faqs.length === 0 ? (
            <p className="text-base-content/60">
              No FAQs yet. Check back again soon.
            </p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq._id}
                  className="bg-base-100/50 backdrop-blur-sm rounded-lg p-4"
                >
                  <summary className="font-semibold cursor-pointer">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-base-content/70">{faq.answer}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default Home;
