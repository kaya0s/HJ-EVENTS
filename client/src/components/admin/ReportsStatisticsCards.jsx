import { TrendingUp, Calendar, DollarSign, Package } from "lucide-react";
import { useEffect, useState } from "react";

const ReportsStatisticsCards = ({ stats }) => {
  const [animatedValues, setAnimatedValues] = useState({
    totalSales: 0,
    bookingCount: 0,
    averageValue: 0,
  });

  // Animate numbers on mount
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedValues({
        totalSales: Math.floor(stats.totalSales * progress),
        bookingCount: Math.floor(stats.bookingCount * progress),
        averageValue: (stats.averageValue * progress).toFixed(2),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues({
          totalSales: stats.totalSales,
          bookingCount: stats.bookingCount,
          averageValue: stats.averageValue,
        });
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats]);

  const topPackage = Object.entries(stats.topPackage || {}).sort(
    ([, a], [, b]) => b - a,
  )[0];

  const cards = [
    {
      title: "Total Sales",
      value: `₱${Number(animatedValues.totalSales).toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      change: "+12.5%",
      changeType: "increase",
    },
    {
      title: "Bookings",
      value: animatedValues.bookingCount,
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+8.2%",
      changeType: "increase",
    },
    {
      title: "Avg. Value",
      value: `₱${Number(animatedValues.averageValue).toLocaleString()}`,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+3.1%",
      changeType: "increase",
    },
    {
      title: "Top Package",
      value: topPackage ? topPackage[0] : "No data",
      subtitle: topPackage ? `${topPackage[1]} bookings` : "",
      icon: Package,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          style={{
            animationDelay: `${index * 100}ms`,
            animation: "fadeInUp 0.5s ease-out forwards",
          }}
        >
          <div className="card-body p-6">
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mb-4`}
            >
              <card.icon className={`w-6 h-6 ${card.textColor}`} />
            </div>

            {/* Title */}
            <p className="text-sm text-base-content/60 font-medium mb-1">
              {card.title}
            </p>

            {/* Value */}
            <h3 className="text-3xl font-bold text-base-content mb-2 truncate">
              {card.value}
            </h3>

            {/* Subtitle or Change */}
            {card.subtitle && (
              <p className="text-xs text-base-content/50">{card.subtitle}</p>
            )}

            {card.change && (
              <div
                className={`flex items-center gap-1 text-sm ${
                  card.changeType === "increase" ? "text-success" : "text-error"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{card.change} from last month</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportsStatisticsCards;
