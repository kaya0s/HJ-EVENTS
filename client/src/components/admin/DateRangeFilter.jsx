import { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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
    <div className="card bg-base-100 shadow-lg border border-base-300">
      <div className="card-body">
        <h3 className="font-semibold mb-4">Date Range</h3>
        <div className="space-y-4">
          <DateRange
            ranges={[range]}
            onChange={handleChange}
            className="mb-4"
          />
          <div className="flex gap-2 flex-wrap">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  if (preset.days) start.setDate(start.getDate() - preset.days);
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
                className="btn btn-sm btn-outline"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
