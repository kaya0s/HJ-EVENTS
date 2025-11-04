import { BookOpen, Users, CheckCircle2, Clock, Search } from "lucide-react";
import { StatCard } from "@/components/ui/StatCards";
import { mockBookings, mockSuppliers } from "@/components/MockData";
import { StatusBadge } from "@/components/layout/admin/StatusBadge";
import AdminLayout from "@/components/layout/admin/AdminLayout";

export default function AdminDashboard() {
  const totalBookings = mockBookings.length;
  const pendingRequests = mockBookings.filter(
    (b) => b.status === "pending"
  ).length;
  const completedEvents = mockBookings.filter(
    (b) => b.status === "completed"
  ).length;
  const totalSuppliers = mockSuppliers.length;

  const recentBookings = mockBookings.slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Bookings"
            value={totalBookings}
            icon={BookOpen}
            trend="+12% From Last Month"
            variant="info"
          />
          <StatCard
            title="Pending Request"
            value={pendingRequests}
            icon={Clock}
            trend="Needs Attention"
            variant="warning"
          />
          <StatCard
            title="Completed Events"
            value={completedEvents}
            icon={CheckCircle2}
            trend="+8% From Last Month"
            variant="success"
          />
          <StatCard
            title="Total Suppliers"
            value={totalSuppliers}
            icon={Users}
            trend="Active Partners"
            variant="info"
          />
        </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Bookings</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-4">
        {recentBookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-4 rounded-lg bg-background border shadow-sm"
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
              <StatusBadge status={booking.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
    </AdminLayout>
  );
}
