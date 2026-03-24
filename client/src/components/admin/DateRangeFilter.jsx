import { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

const DateRangeFilter = ({ onDateChange }) => {
  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const handleChange = (ranges) => {
    const newRange = ranges.selection;
    setRange(newRange);
    onDateChange(newRange.startDate, newRange.endDate);
  };

  const presets = [
    { label: "Last 30 Days", days: 30 },
    { label: "Last 6 Months", months: 6 },
    { label: "This Year", years: 1 },
  ];

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow duration-300">
      <div className="card-body p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-base-content/70" />
          Date Range
        </h3>
        <div className="space-y-6">
          {/* Date Range Picker */}
          <div className="relative">
            <DateRange
              ranges={[range]}
              onChange={handleChange}
              className="rounded-xl overflow-hidden bg-base-200/50"
            />
          </div>

          {/* Quick Select Buttons */}
          <div className="bg-base-200/30 rounded-xl p-4">
            <p className="text-sm font-medium text-base-content/70 mb-3">
              Quick Select
            </p>
            <div className="flex gap-2 flex-wrap">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    if (preset.days)
                      start.setDate(start.getDate() - preset.days);
                    if (preset.months)
                      start.setMonth(start.getMonth() - preset.months);
                    if (preset.years)
                      start.setFullYear(start.getFullYear() - preset.years);
                    const newRange = {
                      startDate: start,
                      endDate: end,
                      key: "selection",
                    };
                    setRange(newRange);
                    onDateChange(start, end);
                  }}
                  className="btn btn-sm btn-outline bg-base-100 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Summary */}
          <div className="text-sm text-base-content/60 bg-primary/5 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Selected Range:</span>
              <span className="text-base-content font-semibold">
                {range.startDate?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                -{" "}
                {range.endDate?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
