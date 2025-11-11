import { useMemo } from "react";
import { BarChart2, PieChart } from "lucide-react";
import { useBookingStore } from "../../store/useBookingStore";

const ReportsAnalytics = () => {
  const { bookings, statistics } = useBookingStore();

  const { totalRevenue, byEventType, topPackages } = useMemo(() => {
    let revenue = 0;
    const eventTypeCounts = { Wedding: 0, Debut: 0, Other: 0 };
    const packageCountMap = new Map();

    for (const b of bookings) {
      // Revenue from accepted or completed bookings
      if (b?.status === "Accepted" || b?.status === "Completed") {
        const price =
          typeof b?.package?.price === "number"
            ? b.package.price
            : Number(b?.package?.price) || 0;
        revenue += price;
      }
      // Event type breakdown
      const type = b?.eventType;
      if (type === "Wedding") eventTypeCounts.Wedding += 1;
      else if (type === "Debut") eventTypeCounts.Debut += 1;
      else eventTypeCounts.Other += 1;
      // Most booked packages
      const pkgName = b?.package?.name || "Unknown";
      packageCountMap.set(pkgName, (packageCountMap.get(pkgName) || 0) + 1);
    }

    const top = Array.from(packageCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalRevenue: revenue,
      byEventType: eventTypeCounts,
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

  const maxEvent = Math.max(
    byEventType.Wedding,
    byEventType.Debut,
    byEventType.Other
  );
  const maxPkg = topPackages.length ? topPackages[0][1] : 0;

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
          {/* Event Type Breakdown */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-2">Bookings by Event Type</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Wedding</span>
                    <span>{byEventType.Wedding}</span>
                  </div>
                  <Bar value={byEventType.Wedding} max={maxEvent} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Debut</span>
                    <span>{byEventType.Debut}</span>
                  </div>
                  <Bar
                    value={byEventType.Debut}
                    max={maxEvent}
                    color="bg-secondary"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Other</span>
                    <span>{byEventType.Other}</span>
                  </div>
                  <Bar
                    value={byEventType.Other}
                    max={maxEvent}
                    color="bg-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Most Booked Packages */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-2">Most Booked Packages</h3>
              <div className="space-y-3">
                {topPackages.length === 0 && (
                  <div className="text-sm text-base-content/60">
                    No data yet
                  </div>
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
    </div>
  );
};

export default ReportsAnalytics;
