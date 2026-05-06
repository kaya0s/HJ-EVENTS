import { useMemo, useState } from "react";
import dayjs from "dayjs";

const statusClasses = {
  Pending: "badge-warning",
  Accepted: "badge-success",
  Completed: "badge-info",
  Cancelled: "badge-error",
};

const AdminCalendar = ({ bookings = [] }) => {
  const [month, setMonth] = useState(dayjs());

  const eventsByDate = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      if (!booking?.weddingDate) return;
      const key = dayjs(booking.weddingDate).format("YYYY-MM-DD");
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push({
        id: booking._id,
        title: booking.title || "Untitled Wedding",
        status: booking.status,
      });
    });

    // Ensure consistent ordering within each date (Accepted/Completed first)
    for (const [key, value] of map.entries()) {
      value.sort((a, b) => {
        const order = { Accepted: 0, Completed: 1, Pending: 2, Cancelled: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      });
      map.set(key, value);
    }

    return map;
  }, [bookings]);

  const daysInMonth = month.daysInMonth();
  const startDay = month.startOf("month").day();

  const goPrev = () => setMonth(month.subtract(1, "month"));
  const goNext = () => setMonth(month.add(1, "month"));

  // --- Responsive Cells Render Function ---
  const renderCells = () => {
    const isMobile =
      typeof window !== "undefined" ? window.innerWidth <= 550 : false;

    // For mobile, show one day per row (list), for desktop, 7-column grid
    let cells = [];

    if (isMobile) {
      // On mobile, just render each day as a row, ignore empty start days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = month.date(day);
        const dateKey = date.format("YYYY-MM-DD");
        const events = eventsByDate.get(dateKey) || [];

        cells.push(
          <div
            key={dateKey}
            className={`rounded-xl border border-base-200 bg-base-100 p-3 flex flex-col gap-2 mb-3 transition hover:shadow ${
              events.length ? "border-primary/40" : ""
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold mb-1">
              <span className="inline-block w-8 text-lg text-primary">
                {day}
              </span>
              {events.length > 0 && (
                <span className="badge badge-sm badge-primary">
                  {events.length}
                </span>
              )}
            </div>

            {events.length === 0 && (
              <div className="text-xs text-base-content/50 italic">
                no event
              </div>
            )}

            {events.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="rounded-lg bg-base-200 p-2 text-xs space-y-1"
              >
                <p className="font-semibold line-clamp-2 leading-snug">
                  {event.title}
                </p>
                <span
                  className={`badge badge-sm ${
                    statusClasses[event.status] || "badge-ghost"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            ))}

            {events.length > 2 && (
              <p className="text-xs text-primary/80">
                +{events.length - 2} more wedding
                {events.length - 2 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        );
      }
    } else {
      // Desktop/Tablet - maintain previous behavior, with grid and initial blanks
      for (let i = 0; i < startDay; i++) {
        cells.push(<div key={`empty-${i}`} className="p-3" />);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = month.date(day);
        const dateKey = date.format("YYYY-MM-DD");
        const events = eventsByDate.get(dateKey) || [];

        cells.push(
          <div
            key={dateKey}
            className={`rounded-xl border border-base-200 bg-base-100 p-3 flex flex-col gap-2 transition hover:shadow ${
              events.length ? "border-primary/40" : ""
            }`}
          >
            <div className="flex items-center justify-between text-base font-semibold">
              <span>{day}</span>
              {events.length > 0 && (
                <span className="badge badge-sm badge-primary">
                  {events.length}
                </span>
              )}
            </div>

            {events.length === 0 && (
              <div className="text-xs text-base-content/50 italic">
                no event
              </div>
            )}

            {events.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="rounded-lg bg-base-200 p-2 text-xs space-y-1"
              >
                <p className="font-semibold line-clamp-2 leading-snug">
                  {event.title}
                </p>
                <span
                  className={`badge badge-sm ${
                    statusClasses[event.status] || "badge-ghost"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            ))}

            {events.length > 2 && (
              <p className="text-xs text-primary/80">
                +{events.length - 2} more wedding
                {events.length - 2 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  // Responsive grid: 7-cols desktop, 2-cols on <=550px, 1-col for <=400px.
  // But on each, the date/day and count stays top/left on each date card.
  // On mobile, weekday labels don't make sense, so hide on small screens.

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <header className="flex items-center justify-between mb-4">
          <button
            onClick={goPrev}
            className="btn btn-sm btn-ghost"
            aria-label="Previous month"
          >
            ‹
          </button>
          <div className="text-lg font-semibold">
            {month.format("MMMM YYYY")}
          </div>
          <button
            onClick={goNext}
            className="btn btn-sm btn-ghost"
            aria-label="Next month"
          >
            ›
          </button>
        </header>

        {/* Weekday labels: show only on larger screens */}
        <div className="grid grid-cols-7 gap-3 text-xs text-base-content/60 uppercase tracking-wide mb-2 hidden sm:grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
            <span key={weekday} className="text-center">
              {weekday}
            </span>
          ))}
        </div>

        {/* Responsive calendar grid */}
        <div
          className={`
            grid 
            grid-cols-7 
            gap-3
            sm:grid-cols-7
            xs:grid-cols-7
            [@media(max-width:550px)]:grid-cols-1
            [@media(max-width:400px)]:grid-cols-1
          `}
        >
          {renderCells()}
        </div>
        {/* On <550px: grid-cols-1 (cards stacked), not shrunk columns */}
      </div>
    </div>
  );
};

export default AdminCalendar;
