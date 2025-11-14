import { create } from "zustand";
import axiosInstance from "../lib/axios.js";

export const useNotificationStore = create((set) => ({
  notifications: [],
  activityLogs: [],
  isLoading: false,

  /**
   * Fetches activity logs for admin
   */
  fetchActivityLogs: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/admin/activity");
      const logs = Array.isArray(res.data?.logs)
        ? res.data.logs
        : Array.isArray(res.data)
        ? res.data
        : [];

      set({ activityLogs: logs });
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      // Don't show error toast for activity logs as it's not critical
      set({ activityLogs: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));
