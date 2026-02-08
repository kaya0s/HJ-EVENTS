import { useState, useEffect } from "react";
import { useBookingStore } from "../../store/useBookingStore";
import DateRangeFilter from "./DateRangeFilter";
import SalesChart from "./SalesChart";
import BookingChart from "./BookingChart";
import axiosInstance from "../../lib/axios";
import { Loader } from "lucide-react";

const ReportsAnalytics = () => {
  const { bookings } = useBookingStore();
  const [filteredData, setFilteredData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set default date range to this year on initial load
  useEffect(() => {
    const end = new Date();
    const start = new Date(end.getFullYear(), 0, 1);
    handleDateChange(start, end);
  }, []);

  const handleDateChange = async (startDate, endDate) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/admin/reports/date-range", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error fetching date range stats:", error);
      // Fallback to client-side calculations if API fails
      const fallbackData = calculateClientSideStats(startDate, endDate);
      setFilteredData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateClientSideStats = (startDate, endDate) => {
    const filteredBookings = bookings.filter((booking) => {
      const createdAt = new Date(booking.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    });

    const monthlyData = {};
    filteredBookings.forEach((booking) => {
      const date = new Date(booking.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlyData[key]) {
        monthlyData[key] = {
          _id: { year: date.getFullYear(), month: date.getMonth() + 1 },
          totalSales: 0,
          bookingCount: 0,
        };
      }
      monthlyData[key].bookingCount += 1;
      if (["accepted", "completed"].includes(booking.status)) {
        monthlyData[key].totalSales += booking.totalPrice;
      }
    });

    const stats = {
      totalSales: filteredBookings
        .filter((b) => ["accepted", "completed"].includes(b.status))
        .reduce((sum, b) => sum + b.totalPrice, 0),
      bookingCount: filteredBookings.length,
      averageValue:
        filteredBookings.length > 0
          ? (
              filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0) /
              filteredBookings.length
            ).toFixed(2)
          : 0,
      topPackage: filteredBookings.reduce((acc, b) => {
        if (b.package?.name) {
          acc[b.package.name] = (acc[b.package.name] || 0) + 1;
        }
        return acc;
      }, {}),
    };

    return {
      stats,
      monthlyData: Object.values(monthlyData).sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        return a._id.month - b._id.month;
      }),
    };
  };

  const displayData = filteredData || {
    stats: { totalSales: 0, bookingCount: 0, averageValue: 0, topPackage: {} },
    monthlyData: [],
  };

  return (
    <div className="card bg-base-100 shadow-lg border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">Reports & Analytics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat shadow">
            <div className="stat-figure text-primary">
              <div className="stat-title">Total Sales</div>
              <div className="stat-value">
                ₱{Number(displayData.stats.totalSales).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="stat shadow">
            <div className="stat-figure text-secondary">
              <div className="stat-title">Bookings</div>
              <div className="stat-value">{displayData.stats.bookingCount}</div>
            </div>
          </div>
          <div className="stat shadow">
            <div className="stat-figure text-accent">
              <div className="stat-title">Avg. Value</div>
              <div className="stat-value">
                ₱{displayData.stats.averageValue}
              </div>
            </div>
          </div>
          <div className="stat shadow">
            <div className="stat-figure text-warning">
              <div className="stat-title">Top Package</div>
              <div className="stat-value">
                {Object.entries(displayData.stats.topPackage)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count]) => `${name} (${count})`)
                  .slice(0, 1) || "No data"}
              </div>
            </div>
          </div>
        </div>

        <DateRangeFilter onDateChange={handleDateChange} />

        {isLoading && (
          <div className="text-center py-8">
            <Loader className="animate-spin mx-auto" size={32} />
            <p className="mt-2 text-base-content/60">Loading statistics...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <SalesChart data={displayData.monthlyData} />
          <BookingChart data={displayData.monthlyData} />
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
