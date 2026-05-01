import { useMemo, useState } from "react";
import dayjs from "dayjs";

const statusClasses = {
  Pending: "badge-warning",
  Accepted: "badge-success",
  Completed: "badge-info",
  Cancelled: "badge-error",
};

const SupplierCalendar = ({ bookings = [] }) => {
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
        client:
          booking.user?.fullName || booking.user?.id?.fullName || "Client",
      });
    });

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

  const renderCells = () => {
    const cells = [];

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
              <p className="text-[11px] text-base-content/60 leading-tight">
                {event.client}
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
              +{events.length - 2} more booking
              {events.length - 2 > 1 ? "s" : ""}
            </p>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <header className="flex items-center justify-between mb-4">
          <button
            onClick={goPrev}
            className="btn btn-sm btn-ghost"
            aria-label="Previous month"
            type="button"
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
            type="button"
          >
            ›
          </button>
        </header>

        <div className="grid grid-cols-7 gap-3 text-xs text-base-content/60 uppercase tracking-wide mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
            <span key={weekday} className="text-center">
              {weekday}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">{renderCells()}</div>
      </div>
    </div>
  );
};

export default SupplierCalendar;
