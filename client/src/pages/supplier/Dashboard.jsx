import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Loader, CalendarClock, CheckCircle, Clock, Users } from "lucide-react";
import SupplierSidebar from "../../components/supplier/SupplierSidebar";
import SupplierCalendar from "../../components/supplier/SupplierCalendar";
import { useAuthStore } from "../../store/useAuthStore";
import { useSupplierDashboardStore } from "../../store/useSupplierDashboardStore";

dayjs.extend(isSameOrAfter);

const Dashboard = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const {
    profile,
    bookings,
    isLoadingBookings,
    isLoadingProfile,
    fetchSupplierProfile,
    fetchSupplierBookings,
  } = useSupplierDashboardStore();

  useEffect(() => {
    if (authUser?.role !== "supplier") {
      navigate("/");
      return;
    }
    fetchSupplierProfile();
    fetchSupplierBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.role, navigate]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter((booking) =>
      dayjs(booking.weddingDate).isAfter(dayjs(), "day")
    ).length;
    const completed = bookings.filter(
      (booking) => booking.status?.toLowerCase() === "completed"
    ).length;
    const pending = bookings.filter(
      (booking) => booking.status?.toLowerCase() === "pending"
    ).length;

    return [
      {
        title: "Total Bookings",
        value: total,
        icon: Users,
        tone: "text-primary",
      },
      {
        title: "Upcoming Events",
        value: upcoming,
        icon: CalendarClock,
        tone: "text-secondary",
      },
      {
        title: "Completed",
        value: completed,
        icon: CheckCircle,
        tone: "text-success",
      },
      {
        title: "Pending",
        value: pending,
        icon: Clock,
        tone: "text-warning",
      },
    ];
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((booking) =>
        booking.weddingDate
          ? dayjs(booking.weddingDate).isSameOrAfter(dayjs(), "day")
          : false
      )
      .sort(
        (a, b) =>
          dayjs(a.weddingDate).valueOf() - dayjs(b.weddingDate).valueOf()
      )
      .slice(0, 5);
  }, [bookings]);

  if (authUser?.role !== "supplier") {
    return null;
  }

  const isLoading = isLoadingBookings || isLoadingProfile;

  return (
    <div className="min-h-screen bg-base-100 lg:flex">
      <SupplierSidebar />
      <main className="flex-1 p-6 transition-all duration-300">
        <div className="max-w-6xl mx-auto space-y-6">
          <header>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back
              {profile?.user?.fullName ? `, ${profile.user.fullName}` : ""}
            </h1>
            <p className="text-base-content/60">
              Manage your assigned weddings, keep track of schedules, and stay
              aligned with the coordination team.
            </p>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.title} className="card bg-base-100 shadow-lg">
                    <div className="card-body flex flex-row items-center gap-3">
                      <stat.icon className={stat.tone} size={28} />
                      <div>
                        <p className="text-sm text-base-content/60">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <SupplierCalendar bookings={bookings} />
                </div>
                <div className="card bg-base-100 shadow-lg h-full">
                  <div className="card-body">
                    <h2 className="card-title">Upcoming Weddings</h2>
                    {upcomingBookings.length === 0 ? (
                      <p className="text-sm text-base-content/60">
                        No scheduled events yet.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {upcomingBookings.map((booking) => (
                          <li
                            key={booking._id}
                            className="rounded-lg border border-base-200 p-3"
                          >
                            <p className="font-semibold">
                              {booking.title || "Untitled Wedding"}
                            </p>
                            <p className="text-sm text-base-content/60">
                              {dayjs(booking.weddingDate).format(
                                "MMMM DD, YYYY"
                              )}
                            </p>
                            <p className="text-xs text-base-content/70">
                              {booking.venue || "Venue TBD"}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
