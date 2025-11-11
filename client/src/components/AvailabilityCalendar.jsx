import { useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export default function AvailabilityCalendar() {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [bookedDates] = useState(["2025-11-10", "2025-11-12", "2025-11-17"]);

  const daysInMonth = selectedMonth.daysInMonth();
  const startDay = selectedMonth.startOf("month").day();
  const today = dayjs().format("YYYY-MM-DD");

  const prevMonth = () => setSelectedMonth(selectedMonth.subtract(1, "month"));
  const nextMonth = () => setSelectedMonth(selectedMonth.add(1, "month"));

  const handleDateClick = (date) => {
    const formatted = date.format("YYYY-MM-DD");
    if (bookedDates.includes(formatted)) {
      toast.error("This date is already booked!");
    } else {
      toast.success("This date is available!");
    }
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const current = selectedMonth.date(d);
      const formatted = current.format("YYYY-MM-DD");
      const isBooked = bookedDates.includes(formatted);
      const isToday = formatted === today;

      days.push(
        <button
          key={d}
          onClick={() => handleDateClick(current)}
          className={`
            flex items-center justify-center w-10 h-10 rounded-lg transition
            text-base font-medium focus:outline-none relative
            ${
              isBooked
                ? "bg-base-200 text-base-content/40 cursor-default"
                : isToday
                ? "border border-primary text-primary-content bg-base-100 shadow"
                : "hover:bg-base-200 text-base-content"
            }
            ${isToday ? "ring-2 ring-primary" : ""}
          `}
          disabled={isBooked}
        >
          {d}
          {/* Dot indicator */}
          <span
            className={`
              absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full
              ${isBooked ? "bg-error" : "bg-success"} 
              ${isBooked ? "opacity-80" : "opacity-0 group-hover:opacity-50"}
            `}
          />
        </button>
      );
    }
    return days;
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6">
      <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5 sm:p-7 transition">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="rounded-full p-2 hover:bg-base-200 transition"
          >
            <svg
              width={18}
              height={18}
              fill="none"
              stroke="currentColor"
              className="text-base-content/60"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold tracking-tight text-base-content select-none">
            {selectedMonth.format("MMMM YYYY")}
          </h2>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="rounded-full p-2 hover:bg-base-200 transition"
          >
            <svg
              width={18}
              height={18}
              fill="none"
              stroke="currentColor"
              className="text-base-content/60"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </header>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2 gap-1 text-base-content/50 text-sm font-medium select-none">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={`${d}-${i}`} className="w-10 text-center tracking-tight">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-3">{renderDays()}</div>

        {/* Legend */}
        <div className="flex justify-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <span className="block w-2.5 h-2.5 rounded-full bg-success"></span>
            <span className="text-sm text-base-content/50">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="block w-2.5 h-2.5 rounded-full bg-error"></span>
            <span className="text-sm text-base-content/50">Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
