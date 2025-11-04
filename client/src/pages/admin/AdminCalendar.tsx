import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mockCalendarEvents } from "@/components/MockData";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // June 2025

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

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return mockCalendarEvents.filter((event) => event.date === dateStr);
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

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Calendar</h1>
        <p className="text-muted-foreground">
          View all scheduled wedding events
        </p>
      </div>

      <Card className="border-border/50 shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center font-semibold text-sm text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {blanks.map((blank) => (
              <div key={`blank-${blank}`} className="p-2 h-24" />
            ))}

            {days.map((day) => {
              const events = getEventsForDate(day);
              return (
                <div
                  key={day}
                  className="p-2 h-24 border border-border/50 rounded-lg hover:border-primary/30 transition-colors overflow-hidden"
                >
                  <div className="text-sm font-medium text-foreground mb-1">
                    {day}
                  </div>
                  <div className="space-y-1">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded truncate"
                        style={{
                          backgroundColor:
                            event.status === "completed"
                              ? "hsl(var(--success) / 0.2)"
                              : event.status === "approved"
                              ? "hsl(var(--info) / 0.2)"
                              : "hsl(var(--warning) / 0.2)",
                        }}
                        title={`${event.clientName} - ${event.supplier}`}
                      >
                        {event.clientName.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: "hsl(var(--warning) / 0.5)" }}
                />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: "hsl(var(--info) / 0.5)" }}
                />
                <span className="text-sm text-muted-foreground">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: "hsl(var(--success) / 0.5)" }}
                />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
