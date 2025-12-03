import { useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import {
  Loader,
  CalendarClock,
  CheckCircle,
  Clock,
  Users,
  BarChart2,
} from "lucide-react";
import SupplierSidebar from "../../components/supplier/SupplierSidebar";
import SupplierCalendar from "../../components/supplier/SupplierCalendar";
import { useAuthStore } from "../../store/useAuthStore";
import { useSupplierDashboardStore } from "../../store/useSupplierDashboardStore";
import { usePermissionsStore } from "../../store/usePermissionsStore";
import toast from "react-hot-toast";

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
  const { isLoaded: permsLoaded, isAllowed } = usePermissionsStore((state) => ({
    isLoaded: state.isLoaded,
    isAllowed: state.isAllowed,
  }));
  const canViewBookings = permsLoaded && isAllowed("supplier", "viewBookings");
  const canGenerateReports =
    permsLoaded && isAllowed("supplier", "generateReports");

  useEffect(() => {
    if (authUser?.role !== "supplier") {
      navigate("/");
      return;
    }
    if (!canViewBookings) return;
    fetchSupplierProfile();
    fetchSupplierBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.role, navigate, canViewBookings]);

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

  const isLoading = isLoadingBookings || isLoadingProfile;
  const handleSupplierReportPreview = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const reportUrl = `${apiUrl}/suppliers/reports/bookings/pdf`;
    const popup = window.open(reportUrl, "_blank", "noopener");
    if (!popup) {
      toast.error("Please allow pop-ups to preview the PDF.");
    }
  }, []);

  if (authUser?.role !== "supplier") {
    return null;
  }

  if (!permsLoaded) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 text-center">
        <div className="max-w-xl space-y-4">
          <p className="text-base-content/70">Loading your supplier access…</p>
        </div>
      </div>
    );
  }

  if (!canViewBookings) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 text-center">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-bold">Bookings hidden for now</h1>
          <p className="text-base-content/70">
            The admin disabled supplier booking visibility. You will regain
            access once it is enabled again.
          </p>
        </div>
      </div>
    );
  }

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

              {canGenerateReports && (
                <section className="card bg-base-100 shadow-lg">
                  <div className="card-body flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="card-title flex items-center gap-2">
                        <BarChart2 className="text-secondary" />
                        Quick performance snapshot
                      </h2>
                      <p className="text-sm text-base-content/60">
                        Download a summarized PDF of your current assignments
                        and completion stats.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleSupplierReportPreview}
                    >
                      View bookings PDF
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
