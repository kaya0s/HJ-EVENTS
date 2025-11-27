import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ReportsAnalytics from "../../components/admin/ReportsAnalytics";
import { useAuthStore } from "../../store/useAuthStore";
import { useBookingStore } from "../../store/useBookingStore";
import { Loader } from "lucide-react";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

const Reports = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { bookings, isLoading, fetchAllBookings } = useBookingStore();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = useCallback(async () => {
    setIsDownloading(true);
    try {
      const response = await axiosInstance.get("/admin/reports/bookings/pdf", {
        responseType: "blob",
      });
      const reportId =
        response.headers["x-report-id"] ||
        `BR-${Date.now().toString(36).toUpperCase()}`;
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `booking-report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to download report"
      );
    } finally {
      setIsDownloading(false);
    }
  }, []);

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchAllBookings();
  }, [authUser, navigate, fetchAllBookings]);

  if (authUser?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <AdminSidebar />
      <main className="lg:ml-20 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <div className="space-y-2">
              <p className="text-base-content/60">
                Monitor booking performance, revenue, and upcoming events.
              </p>
              <button
                type="button"
                className="btn btn-primary w-full md:w-auto"
                onClick={handleDownloadReport}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Generating PDF...
                  </>
                ) : (
                  "Download sample PDF"
                )}
              </button>
            </div>
          </header>

          {isLoading && bookings.length === 0 ? (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="text-center py-12">
                  <Loader className="animate-spin mx-auto" size={32} />
                </div>
              </div>
            </div>
          ) : (
            <ReportsAnalytics />
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
