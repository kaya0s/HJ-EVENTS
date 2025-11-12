import { usePackageStore } from "../store/usePackageStore";
import { useEffect, useState } from "react";
import BookingModal from "../components/BookingModal";

const Packages = () => {
  const { packages, fetchPackages, bookPackage } = usePackageStore();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleBookClick = (pkg) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const handleBookPackage = async (bookingData) => {
    await bookPackage(bookingData);
    handleCloseModal();
  };

  // Only display packages with isAvailable === true
  const availablePackages = packages.filter((pkg) => pkg.isAvailable);

  return (
    <section className="container mx-auto w-full max-w-screen-2xl px-2 md:px-10 py-10 space-y-12">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
          Packages
        </p>
        <h1 className="text-4xl font-bold text-base-content">
          Thoughtfully curated experiences designed to fit your love story.
        </h1>
        <p className="text-base text-base-content/70 leading-relaxed">
          Choose a package that matches your celebration, then personalize every
          detail with your dedicated planning team.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {availablePackages.map((pkg) => {
          const imageUrl = pkg.imageURL;
          return (
            <article
              key={pkg._id || pkg.name}
              className="flex flex-col gap-6  border border-base-300 bg-base-100 p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative w-full h-48 mb-2  overflow-hidden bg-base-200 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={`Image for ${pkg.name}`}
                  className="object-cover w-full h-full"
                  style={{ objectPosition: "center" }}
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-3 py-1  shadow opacity-80">
                  {pkg.price}
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-base-content">
                  {pkg.name}
                </h2>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  {pkg.description}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-primary mt-auto w-full"
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
        onBook={handleBookPackage}
      />
    </section>
  );
};

export default Packages;
