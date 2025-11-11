import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useBookingStore } from "../../store/useBookingStore";
import AdminSidebar from "../../components/admin/AdminSidebar";
import StatisticsCards from "../../components/admin/StatisticsCards";
import BookingsTable from "../../components/admin/BookingsTable";
import BookingDetailsModal from "../../components/admin/BookingDetailsModal";
import SuppliersSection from "../../components/admin/SuppliersSection";
import NotificationsPanel from "../../components/admin/NotificationsPanel";
import ManageClients from "./ManageClients";
import { Loader } from "lucide-react";
import ReportsAnalytics from "../../components/admin/ReportsAnalytics";

const Dashboard = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { bookings, statistics, isLoading, fetchAllBookings } =
    useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(tabParam); // overview, bookings, suppliers

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAllBookings();
  }, [authUser, navigate, fetchAllBookings]);

  useEffect(() => {
    const tab = searchParams.get("tab") || "overview";
    setActiveTab(tab);
  }, [searchParams]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    // Refresh bookings after modal closes
    fetchAllBookings();
  };

  if (authUser?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <AdminSidebar />

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-base-content/60">
              Manage bookings, suppliers, and system activities
            </p>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <button
              className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab("overview");
                setSearchParams({});
              }}
            >
              Overview
            </button>
            <button
              className={`tab ${activeTab === "bookings" ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab("bookings");
                setSearchParams({ tab: "bookings" });
              }}
            >
              Bookings
            </button>
            <button
              className={`tab ${activeTab === "suppliers" ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab("suppliers");
                setSearchParams({ tab: "suppliers" });
              }}
            >
              Suppliers
            </button>
            <button
              className={`tab ${activeTab === "clients" ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab("clients");
                setSearchParams({ tab: "clients" });
              }}
            >
              Clients & Users
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <StatisticsCards statistics={statistics} />

              {/* Reports & Analytics Section */}
              <ReportsAnalytics />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bookings Section */}
                <div className="lg:col-span-2">
                  <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                      <h2 className="card-title mb-4">Recent Bookings</h2>
                      {isLoading ? (
                        <div className="text-center py-12">
                          <Loader className="animate-spin mx-auto" size={32} />
                        </div>
                      ) : (
                        <BookingsTable
                          bookings={bookings.slice(0, 5)}
                          onViewDetails={handleViewDetails}
                        />
                      )}
                      {bookings.length > 5 && (
                        <div className="card-actions justify-end mt-4">
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setActiveTab("bookings")}
                          >
                            View All Bookings
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notifications Panel */}
                <div className="lg:col-span-1">
                  <NotificationsPanel />
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">All Bookings</h2>
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader className="animate-spin mx-auto" size={32} />
                  </div>
                ) : (
                  <BookingsTable
                    bookings={bookings}
                    onViewDetails={handleViewDetails}
                  />
                )}
              </div>
            </div>
          )}

          {/* Suppliers Tab */}
          {activeTab === "suppliers" && <SuppliersSection />}

          {/* Clients & Users Tab */}
          {activeTab === "clients" && <ManageClients />}
        </div>
      </main>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
