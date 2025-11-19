import { useState } from "react";

const defaultFilters = {
  search: "",
  status: "all",
  startDate: "",
  endDate: "",
};

const statusOptions = [
  "all",
  "pending",
  "accepted",
  "completed",
  "cancelled",
  "rejected",
  "expired",
];

const BookingFilters = ({ initialFilters = {}, onApply, onReset }) => {
  const [filters, setFilters] = useState({
    ...defaultFilters,
    ...initialFilters,
  });

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onReset?.();
    onApply(defaultFilters);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text text-sm font-medium">Search</span>
        </label>
        <input
          type="text"
          className="input input-bordered"
          placeholder="Client, title, venue..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-sm font-medium">Status</span>
        </label>
        <select
          className="select select-bordered"
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All statuses" : option}
            </option>
          ))}
        </select>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-sm font-medium">From date</span>
        </label>
        <input
          type="date"
          className="input input-bordered"
          value={filters.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-sm font-medium">To date</span>
        </label>
        <input
          type="date"
          className="input input-bordered"
          value={filters.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
        />
      </div>
      <div className="md:col-span-4 flex gap-3 justify-end">
        <button type="button" className="btn btn-ghost" onClick={handleReset}>
          Reset
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onApply(filters)}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default BookingFilters;
