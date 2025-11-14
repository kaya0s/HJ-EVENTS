import { useState } from "react";
import dayjs from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DatePickerCalendar({
  selectedDate,
  onDateSelect,
  bookedDates = [],
}) {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const daysInMonth = selectedMonth.daysInMonth();
  const startDay = selectedMonth.startOf("month").day();
  const today = dayjs().format("YYYY-MM-DD");

  const prevMonth = () => setSelectedMonth(selectedMonth.subtract(1, "month"));
  const nextMonth = () => setSelectedMonth(selectedMonth.add(1, "month"));

  const handleDateClick = (date) => {
    if (!onDateSelect) {
      const formatted = date.format("YYYY-MM-DD");
      const isBooked = bookedDates.includes(formatted);
      const isPast = date.isBefore(dayjs(), "day");

      if (isPast) {
        toast.error("Cannot select past dates");
      } else if (isBooked) {
        toast.error("This date is already booked!");
      } else {
        toast.success(`Available: ${formatted}`);
      }
      return;
    }

    const formatted = date.format("YYYY-MM-DD");
    const isBooked = bookedDates.includes(formatted);
    const isPast = date.isBefore(dayjs(), "day");

    if (isPast) {
      toast.error("Cannot select past dates");
      return;
    }

    if (isBooked) {
      toast.error("This date is already booked!");
      return;
    }

    onDateSelect(formatted);
  };

  // Minimalist indicator logic:
  // Booked: faded text with strikethrough
  // Selected: filled light primary bg, bold text
  // Today: subtle circle border
  // Available: normal text
  const renderDays = () => {
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const current = selectedMonth.date(d);
      const formatted = current.format("YYYY-MM-DD");
      const isBooked = bookedDates.includes(formatted);
      const isPast = current.isBefore(dayjs(), "day");
      const isToday = formatted === today;
      const isSelected = formatted === selectedDate;

      const baseClasses =
        "aspect-square relative flex items-center justify-center rounded-lg transition-all duration-100 cursor-pointer";
      let stateClass = "bg-base-100 text-base-content";
      if (isPast) {
        stateClass =
          "bg-base-100 text-base-content/20 cursor-not-allowed opacity-40";
      } else if (isBooked) {
        stateClass =
          "bg-base-200 text-base-content/40 line-through cursor-not-allowed";
      } else if (isSelected) {
        stateClass =
          "bg-primary/10 border border-primary text-primary font-semibold";
      } else if (isToday) {
        stateClass = "border border-accent/60 text-base-content";
      }

      days.push(
        <button
          key={d}
          type="button"
          onClick={() => handleDateClick(current)}
          disabled={isPast || isBooked}
          tabIndex={isPast ? -1 : 0}
          title={
            isPast
              ? "Past date - not available"
              : isBooked
              ? "Already booked - not available"
              : isSelected
              ? "Selected"
              : isToday
              ? "Today"
              : `Available on ${formatted}`
          }
          className={`${baseClasses} ${stateClass} ${
            isSelected ? "shadow-lg ring-2 ring-primary/20 z-10" : ""
          } ${isToday && !isSelected ? "ring-2 ring-accent/40" : ""} ${
            isBooked ? "" : "hover:bg-base-200"
          }`}
        >
          <span className="relative z-10">{d}</span>
          {/* Minimal selected dot indicator (only if not today) */}
          {isSelected && !isToday && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-primary rounded-full" />
          )}
          {/* Minimal today dot (only if not selected) */}
          {isToday && !isSelected && (
            <span className="absolute bottom-1 right-1 h-1.5 w-1.5 bg-accent rounded-full" />
          )}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="bg-base-100 shadow-lg border border-base-200 rounded-2xl px-6 pt-6 pb-3 md:pb-5 md:px-8 max-w-sm mx-auto transition-all duration-200">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 gap-2">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="rounded-full h-9 w-9 flex items-center justify-center bg-base-200 hover:bg-base-300 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center min-w-[110px]">
            <span className="flex items-center gap-1 font-bold text-lg md:text-xl text-base-content">
              <CalendarIcon className="w-5 h-5 text-primary/70" />
              {selectedMonth.format("MMMM")}
            </span>
            <span className="text-xs uppercase tracking-widest text-base-content/60 mt-0.5">
              {selectedMonth.format("YYYY")}
            </span>
          </div>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="rounded-full h-9 w-9 flex items-center justify-center bg-base-200 hover:bg-base-300 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </header>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-3 gap-2 text-base-content/60 text-[0.9rem] font-medium tracking-wide select-none">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={`${d}-${i}`} className="w-10 text-center">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="calendar-grid grid grid-cols-7 gap-2">
          {renderDays()}
        </div>

        {/* Minimal Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-6 pt-4 border-t border-base-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-primary rounded-full" />
            <span className="font-normal text-base-content/60">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-accent rounded-full" />
            <span className="font-normal text-base-content/60">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-1 border-b border-base-content/40" />
            <span className="font-normal text-base-content/60">Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
