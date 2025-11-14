import { useEffect } from "react";
import { Bell, Clock } from "lucide-react";
import { useNotificationStore } from "../../store/useNotificationStore";
import dayjs from "dayjs";

const NotificationsPanel = () => {
  const { activityLogs, isLoading, fetchActivityLogs } = useNotificationStore();

  useEffect(() => {
    fetchActivityLogs();
    // Refresh activity logs every 30 seconds
    const interval = setInterval(fetchActivityLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchActivityLogs]);

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={24} className="text-primary" />
          <h3 className="text-xl font-bold">Activity Log</h3>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : activityLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-base-content/60">No activity logs yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activityLogs.map((log) => (
              <div
                key={log._id}
                className="flex items-start gap-3 p-3 bg-base-200 rounded-lg"
              >
                <Clock size={16} className="mt-1 text-base-content/50" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{log.action}</p>
                  <p className="text-xs text-base-content/60">
                    {log.actorName || "System"}
                  </p>
                  {log.details && (
                    <p className="text-xs text-base-content/50 mt-1">
                      {log.details}
                    </p>
                  )}
                  <p className="text-xs text-base-content/40 mt-1">
                    {dayjs(log.createdAt).format("MMM DD, YYYY HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
