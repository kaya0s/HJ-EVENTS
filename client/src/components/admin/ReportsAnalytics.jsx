import { useMemo } from "react";
import { BarChart2, PieChart } from "lucide-react";
import { useBookingStore } from "../../store/useBookingStore";

const StatusLegend = ({ series }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {series.map((item) => (
      <div key={item.label} className="rounded-lg bg-base-100 p-3 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-base-content/60">
          {item.label}
        </p>
        <p className="text-lg font-semibold text-base-content">{item.value}</p>
      </div>
    ))}
  </div>
);

const StatusLineChart = ({ series }) => {
  const values = series.map((s) => s.value);
  const max = Math.max(...values, 0);
  const width = 320;
  const height = 180;
  const padding = 28;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const step = series.length > 1 ? innerWidth / (series.length - 1) : 0;

  if (max === 0) {
    return (
      <div className="space-y-4">
        <div className="flex h-48 items-center justify-center rounded-lg bg-base-100/70 text-sm text-base-content/60">
          Not enough booking data to plot a trend yet.
        </div>
        <StatusLegend series={series} />
      </div>
    );
  }

  const points = series.map((item, index) => {
    const ratio = item.value / max;
    const x = padding + step * index;
    const y = padding + (innerHeight - ratio * innerHeight);
    return { ...item, x, y };
  });

  const polylinePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const areaPath = [
    `M ${points[0].x} ${points[0].y}`,
    ...points.slice(1).map((pt) => `L ${pt.x} ${pt.y}`),
    `L ${padding + innerWidth} ${height - padding}`,
    `L ${padding} ${height - padding}`,
    "Z",
  ].join(" ");

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <defs>
          <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--p))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--p))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={padding + innerWidth}
          y2={height - padding}
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.2"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.2"
        />

        {/* Area under line */}
        <path d={areaPath} fill="url(#statusGradient)" />

        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="hsl(var(--p))"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Points */}
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="hsl(var(--p))" />
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              className="text-xs fill-base-content/70"
            >
              {point.value}
            </text>
            <text
              x={point.x}
              y={height - padding + 16}
              textAnchor="middle"
              className="text-[10px] uppercase tracking-wide fill-base-content/60"
            >
              {point.label.slice(0, 3)}
            </text>
          </g>
        ))}
      </svg>

      <StatusLegend series={series} />
    </div>
  );
};

const ReportsAnalytics = () => {
  const { bookings, statistics } = useBookingStore();

  const { totalRevenue, statusCounts, upcomingWeddings, topPackages } =
    useMemo(() => {
      let revenue = 0;
      const statusMap = {
        pending: 0,
        accepted: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0,
      };
      const packageCountMap = new Map();
      const upcoming = [];

      for (const booking of bookings) {
        const status = booking?.status?.toLowerCase();
        if (status && Object.prototype.hasOwnProperty.call(statusMap, status)) {
          statusMap[status] += 1;
        }

        if (status === "accepted" || status === "completed") {
          const price =
            typeof booking?.package?.price === "number"
              ? booking.package.price
              : Number(booking?.package?.price) || 0;
          revenue += price;
        }

        const pkgName = booking?.package?.name || "Unknown";
        packageCountMap.set(pkgName, (packageCountMap.get(pkgName) || 0) + 1);

        if (booking?.weddingDate) {
          upcoming.push({
            id: booking._id,
            title: booking.title || "Untitled Wedding",
            date: booking.weddingDate,
            status: booking.status,
          });
        }
      }

      const upcomingSorted = upcoming
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      const top = Array.from(packageCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      return {
        totalRevenue: revenue,
        statusCounts: statusMap,
        upcomingWeddings: upcomingSorted,
        topPackages: top,
      };
    }, [bookings]);

  // Simple inline bar representations without external chart libs
  const Bar = ({ value, max, color = "bg-primary" }) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
      <div className="w-full h-2 bg-base-300 rounded">
        <div className={`h-2 ${color} rounded`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  const maxPkg = topPackages.length ? topPackages[0][1] : 0;
  const statusSeries = [
    { label: "Pending", value: statusCounts.Pending },
    { label: "Accepted", value: statusCounts.Accepted },
    { label: "Completed", value: statusCounts.Completed },
    { label: "Cancelled", value: statusCounts.Cancelled },
  ];

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">Reports & Analytics</h2>
          <div className="text-sm text-base-content/60">
            Total bookings: {statistics.total}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metrics */}
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <BarChart2 />
              </div>
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value">
                ₱{Number(totalRevenue).toLocaleString()}
              </div>
              <div className="stat-desc">From Accepted/Completed bookings</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <PieChart />
              </div>
              <div className="stat-title">Status</div>
              <div className="stat-value text-secondary">
                {statistics.accepted + statistics.completed}
              </div>
              <div className="stat-desc">
                Accepted + Completed out of {statistics.total}
              </div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Cancelled</div>
              <div className="stat-value text-error">
                {statistics.cancelled}
              </div>
              <div className="stat-desc">All-time</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Status Breakdown */}
          <div className="card bg-base-200 h-full">
            <div className="card-body">
              <h3 className="font-semibold mb-2">Status Breakdown</h3>
              <div className="min-h-[275px] flex items-center">
                <StatusLineChart series={statusSeries} />
              </div>
            </div>
          </div>

          {/* Upcoming Weddings */}
          <div className="card bg-base-200 h-full">
            <div className="card-body">
              <h3 className="font-semibold mb-2">Upcoming Weddings</h3>
              <div className="min-h-[275px] flex items-center">
                {upcomingWeddings.length === 0 ? (
                  <div className="text-sm text-base-content/60 w-full text-center">
                    No events yet
                  </div>
                ) : (
                  <ul className="space-y-3 w-full">
                    {upcomingWeddings.map((event) => (
                      <li
                        key={event.id}
                        className="rounded-lg bg-base-100 p-3 shadow-sm"
                      >
                        <p className="font-semibold text-base-content">
                          {event.title}
                        </p>
                        <p className="text-sm text-base-content/60">
                          {new Date(event.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <span className="badge badge-outline mt-2">
                          {event.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Most Booked Packages */}
        <div className="card bg-base-200 mt-6">
          <div className="card-body">
            <h3 className="font-semibold mb-2">Most Booked Packages</h3>
            <div className="space-y-3">
              {topPackages.length === 0 && (
                <div className="text-sm text-base-content/60">No data yet</div>
              )}
              {topPackages.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{name}</span>
                    <span>{count}</span>
                  </div>
                  <Bar value={count} max={maxPkg} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
