import { StatCard } from "@/components/ui/StatCards";
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalBookings: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);

  // Fetch stats from your API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchRecentBookings = async () => {
      try {
        const response = await fetch("/api/admin/recent-bookings");
        const data = await response.json();
        setRecentBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchStats();
    fetchRecentBookings();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={Calendar}
            variant="default"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            variant="success"
          />
          <StatCard
            title="Total Revenue"
            value={`₱${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            variant="info"
          />
          <StatCard
            title="Active Bookings"
            value={stats.totalBookings}
            icon={TrendingUp}
            variant="warning"
          />
        </div>

        {/* Recent Bookings */}
        <Card className="border-border/50 shadow-soft">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {booking.clientName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.eventDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {booking.supplier}
                    </p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
