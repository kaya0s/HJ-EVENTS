import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/layout/admin/StatusBadge";
import { mockBookings } from "@/components/MockData";
import type { Booking } from "@/components/MockData";
import { Search, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = (id: string) => {
    setBookings(
      bookings.map((b) =>
        b.id === id ? { ...b, status: "approved" as const } : b
      )
    );
    toast.success("Booking approved successfully");
  };

  const handleDecline = (id: string) => {
    setBookings(
      bookings.map((b) =>
        b.id === id ? { ...b, status: "declined" as const } : b
      )
    );
    toast.error("Booking declined");
  };

  const handleComplete = (id: string) => {
    setBookings(
      bookings.map((b) =>
        b.id === id ? { ...b, status: "completed" as const } : b
      )
    );
    toast.success("Event marked as completed");
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bookings Management
        </h1>
        <p className="text-muted-foreground">
          Review and manage all wedding booking requests
        </p>
      </div>

      <Card className="border-border/50 shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Bookings</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Client Name
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Event Date
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Supplier
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Contact
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 text-sm font-medium text-foreground">
                      {booking.clientName}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(booking.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {booking.supplier}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {booking.contactInfo}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {booking.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(booking.id)}
                              className="text-success border-success/30 hover:bg-success/10"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDecline(booking.id)}
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {booking.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleComplete(booking.id)}
                            className="text-success border-success/30 hover:bg-success/10"
                          >
                            Mark Done
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
