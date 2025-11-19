import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const StatisticsCards = ({ statistics }) => {
  const cards = [
    {
      title: "Total Bookings",
      value: statistics?.total || 0,
      icon: Calendar,
      color: "bg-primary",
      textColor: "text-primary-content",
    },
    {
      title: "Pending Requests",
      value: statistics?.pending || 0,
      icon: Clock,
      color: "bg-warning",
      textColor: "text-warning-content",
    },
    {
      title: "Completed Events",
      value: statistics?.completed || 0,
      icon: CheckCircle,
      color: "bg-success",
      textColor: "text-success-content",
    },
    {
      title: "Cancelled",
      value: statistics?.cancelled || 0,
      icon: XCircle,
      color: "bg-error",
      textColor: "text-error-content",
    },
    {
      title: "Expired Requests",
      value: statistics?.expired || 0,
      icon: AlertTriangle,
      color: "bg-base-200",
      textColor: "text-base-content",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`${card.color} ${card.textColor} rounded-xl p-6 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <div className={`${card.textColor} opacity-80`}>
                <Icon size={32} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsCards;
