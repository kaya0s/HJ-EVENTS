import { BookOpen, Users, CheckCircle2, Clock } from "lucide-react";
import { StatCard } from "@/components/layout/admin/StatCard";
import { mockBookings, mockSuppliers } from "@/components/MockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/layout/admin/StatusBadge";

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
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your events.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={BookOpen}
          trend="+12% from last month"
          variant="default"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          icon={Clock}
          trend="Needs attention"
          variant="warning"
        />
        <StatCard
          title="Completed Events"
          value={completedEvents}
          icon={CheckCircle2}
          trend="+8% from last month"
          variant="success"
        />
        <StatCard
          title="Total Suppliers"
          value={totalSuppliers}
          icon={Users}
          trend="Active partners"
          variant="info"
        />
      </div>

      <Card className="border-border/50 shadow-soft">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
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
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
