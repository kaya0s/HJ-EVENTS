import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PackageItem = {
  id: string;
  name: string;
  price: number;
  description: string;
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const BookingPage = () => {
  const query = useQuery();
  const selectedId = query.get("packageId") || "";

  const packages = useMemo<PackageItem[]>(
    () => [
      {
        id: "basic",
        name: "Basic Package",
        price: 799,
        description: "Essential coordination for small events.",
      },
      {
        id: "standard",
        name: "Standard Package",
        price: 1999,
        description: "Planning support and enhanced experience.",
      },
      {
        id: "premium",
        name: "Premium Package",
        price: 4499,
        description: "Full service planning and luxury touches.",
      },
    ],
    []
  );

  const pkg = packages.find((p) => p.id === selectedId);

  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder submission; integrate API later
    alert(
      `Request submitted for ${clientName} (${email}) on ${eventDate}${
        pkg ? ` with ${pkg.name}` : ""
      }.`
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Book Your Event</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="clientName">Full Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any preferences or details"
              />
            </div>
            <Button type="submit" className="w-full">
              Submit Booking Request
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Selected Package</h2>
          {pkg ? (
            <div>
              <div className="text-lg font-medium">{pkg.name}</div>
              <div className="text-2xl font-bold my-2">${pkg.price}</div>
              <p className="text-gray-600">{pkg.description}</p>
            </div>
          ) : (
            <p className="text-gray-600">
              No package selected. You can continue or choose one from Packages.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
