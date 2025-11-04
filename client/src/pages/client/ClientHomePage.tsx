import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ClientNavBar } from "@/components/layout/client/ClientNavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

type PackageItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
};

type StoredUser = {
  id?: string;
  role?: string;
  email?: string;
  hasBooking?: boolean;
};

export const ClientHomePage = () => {
  const navigate = useNavigate();
  const [hasBooking, setHasBooking] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const user: StoredUser | null = raw ? JSON.parse(raw) : null;
      const bookingRaw = localStorage.getItem("booking");
      // Consider any persisted booking object or user.hasBooking flag as booked
      setHasBooking(Boolean(user?.hasBooking) || Boolean(bookingRaw));
    } catch {
      setHasBooking(false);
    }
  }, []);

  const packages = useMemo<PackageItem[]>(
    () => [
      {
        id: "basic",
        name: "Basic Package",
        price: 799,
        description: "Essential coordination for small events.",
        features: ["Event day coordination", "Vendor liaison", "Basic decor"],
      },
      {
        id: "standard",
        name: "Standard Package",
        price: 1999,
        description: "Planning support and enhanced experience.",
        features: [
          "Planning assistance",
          "Venue coordination",
          "Catering guidance",
        ],
      },
      {
        id: "premium",
        name: "Premium Package",
        price: 4499,
        description: "Full service planning and luxury touches.",
        features: ["Full planning", "Premium decor", "On-site manager"],
      },
    ],
    []
  );

  const selectPackage = (pkgId: string) => {
    navigate(`/book?packageId=${encodeURIComponent(pkgId)}`);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const isDateAvailable = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    if (checkDate < today) return false;
    // Mock: mark dates as available (every 3rd day is unavailable for demo)
    return day % 3 !== 0;
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number) => {
    if (isDateAvailable(day)) {
      const dateStr = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      navigate(`/book?date=${dateStr}`);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  return (
    <>
      <ClientNavBar />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-foreground">
                Craft unforgettable moments with HJ Events
              </h1>
              <p className="mt-4 text-lg text-foreground/80 md:text-xl">
                From intimate gatherings to grand celebrations, choose a package
                that suits your vision and budget.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById("packages");
                    if (el)
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Explore Packages
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">Talk to an expert</Link>
                </Button>
              </div>
            </div>

            {/* Right: Calendar */}
            <div className="flex justify-center lg:justify-end">
              <Card className="p-6 bg-background/50 backdrop-blur-sm border-white/10 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      {monthNames[currentDate.getMonth()]}{" "}
                      {currentDate.getFullYear()}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={previousMonth}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={nextMonth}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground py-1"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {blanks.map((blank) => (
                    <div key={`blank-${blank}`} className="aspect-square" />
                  ))}
                  {days.map((day) => {
                    const available = isDateAvailable(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`aspect-square flex items-center justify-center rounded-md text-sm transition-colors ${
                          available
                            ? "bg-primary/20 text-primary font-semibold cursor-pointer hover:bg-primary/30 hover:scale-105"
                            : "text-muted-foreground/40 line-through cursor-not-allowed"
                        }`}
                        onClick={() => handleDateClick(day)}
                        disabled={!available}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Select an available date to book
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        {hasBooking ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              You have an active booking
            </h2>
            <p className="text-muted-foreground">
              Thanks for choosing HJ Events. You can manage your booking from
              your profile.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link to="/profile">Go to Profile</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </section>
        ) : (
          <section id="packages">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Packages</h2>
              <Button
                variant="link"
                onClick={() => {
                  const el = document.getElementById("packages");
                  if (el)
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                See all
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="p-6 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">{pkg.name}</h3>
                    <p className="text-muted-foreground mt-1">
                      {pkg.description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="text-3xl font-bold mb-3">${pkg.price}</div>
                    <ul className="list-disc pl-5 space-y-1 mb-5 text-muted-foreground">
                      {pkg.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      onClick={() => selectPackage(pkg.id)}
                    >
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};
