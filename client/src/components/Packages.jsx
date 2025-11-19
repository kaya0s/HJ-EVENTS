import { usePackageStore } from "../store/usePackageStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import BookingModal from "../components/BookingModal";
import { useAuthStore } from "../store/useAuthStore";

const Packages = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { packages, fetchPackages } = usePackageStore();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleBookClick = (pkg) => {
    if (!authUser) {
      toast.error("Please login first to book a package");
      navigate("/login");
      return;
    }

    if (authUser.role !== "user") {
      toast.error("Only clients can book packages");
      return;
    }

    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  // Only display packages with isAvailable === true
  const availablePackages = packages.filter((pkg) => pkg.isAvailable);

  return (
    <section className="container mx-auto w-full max-w-screen-2xl px-4 md:px-10 py-12 md:py-16 space-y-10 md:space-y-12">
      <div className="max-w-2xl space-y-4 px-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
          Packages
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-base-content">
          Thoughtfully curated experiences designed to fit your love story.
        </h1>
        <p className="text-base md:text-lg text-base-content/70 leading-relaxed">
          Choose a package that matches your celebration, then personalize every
          detail with your dedicated planning team.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 lg:grid-cols-3">
        {availablePackages.map((pkg) => {
          const imageUrl = pkg.imageURL;
          return (
            <article
              key={pkg._id || pkg.name}
              className="flex flex-col gap-3 md:gap-6 border border-base-300 bg-base-100 p-4 md:p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative w-full h-32 md:h-48 mb-1 md:mb-2 overflow-hidden bg-base-200 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={`Image for ${pkg.name}`}
                  className="object-cover w-full h-full"
                  style={{ objectPosition: "center" }}
                  loading="lazy"
                />
                <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-primary text-white text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 shadow opacity-80">
                  {pkg.price}
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <h2 className="text-base md:text-2xl font-semibold text-base-content">
                  {pkg.name}
                </h2>
                <p className="text-xs md:text-sm text-base-content/70 leading-relaxed line-clamp-3 md:line-clamp-none">
                  {pkg.description}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-primary btn-sm md:btn-md mt-auto w-full text-xs md:text-sm"
                onClick={() => handleBookClick(pkg)}
              >
                Book this package
              </button>
            </article>
          );
        })}
      </div>

      <BookingModal
        package={selectedPackage}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Packages;
