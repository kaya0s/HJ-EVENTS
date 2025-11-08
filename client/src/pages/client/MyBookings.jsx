const sampleBookings = [
  {
    id: "BKG-2025-001",
    eventDate: "March 15, 2025",
    package: "Luxe Romance",
    venue: "The Glass Garden",
    status: "Confirmed",
  },
  {
    id: "BKG-2025-012",
    eventDate: "June 2, 2025",
    package: "Eternal Bloom",
    venue: "Villa Milagros",
    status: "In Planning",
  },
];

const statusStyles = {
  Confirmed: "badge-success",
  "In Planning": "badge-warning",
  Pending: "badge-neutral",
};

const MyBookings = () => {
  return (
    <section className="container mx-auto px-4 py-16 space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
            Your Weddings
          </p>
          <h1 className="text-3xl font-bold text-base-content">My Bookings</h1>
          <p className="text-base text-base-content/70">
            Track timelines, packages, and milestones for each celebration.
          </p>
        </div>
        <button type="button" className="btn btn-primary">
          Plan a new event
        </button>
      </header>

      <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-lg">
        <table className="hidden min-w-full table-fixed text-left text-sm md:table">
          <thead className="bg-base-200 text-xs uppercase text-base-content/60">
            <tr>
              <th className="px-6 py-4 font-semibold">Booking ID</th>
              <th className="px-6 py-4 font-semibold">Event Date</th>
              <th className="px-6 py-4 font-semibold">Package</th>
              <th className="px-6 py-4 font-semibold">Venue</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-300">
            {sampleBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-base-200/40">
                <td className="px-6 py-4 font-medium text-base-content">
                  {booking.id}
                </td>
                <td className="px-6 py-4 text-base-content/70">
                  {booking.eventDate}
                </td>
                <td className="px-6 py-4 text-base-content/70">
                  {booking.package}
                </td>
                <td className="px-6 py-4 text-base-content/70">
                  {booking.venue}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`badge ${
                      statusStyles[booking.status] || "badge-ghost"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-4 p-6 md:hidden">
          {sampleBookings.map((booking) => (
            <div
              key={booking.id}
              className="space-y-2 rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-base-content">
                  {booking.package}
                </p>
                <span
                  className={`badge ${
                    statusStyles[booking.status] || "badge-ghost"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
              <p className="text-xs uppercase tracking-wide text-base-content/50">
                {booking.id}
              </p>
              <div className="space-y-1 text-sm text-base-content/70">
                <p>
                  <span className="font-medium text-base-content">
                    Event date:
                  </span>{" "}
                  {booking.eventDate}
                </p>
                <p>
                  <span className="font-medium text-base-content">Venue:</span>{" "}
                  {booking.venue}
                </p>
              </div>
              <button type="button" className="btn btn-link btn-sm px-0">
                View timeline
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyBookings;
