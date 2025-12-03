import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const usePermissionsStore = create((set, get) => ({
  // Map of role -> { [key]: boolean }
  permissions: {},
  // Raw definitions coming from the server so the client does not hardcode them.
  roleDefinitions: {},
  isLoading: false,
  isLoaded: false,
  error: null,

  initialize: async () => {
    // Avoid duplicate fetches
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/permissions");
      const { definitions, values } = res.data || {};
      set({
        roleDefinitions: definitions || {},
        permissions: values || {},
        isLoading: false,
        isLoaded: true,
      });
    } catch (error) {
      console.error("Failed to load permissions from server", error);
      set({
        isLoading: false,
        isLoaded: false,
        error: error.response?.data?.message || error.message,
      });
    }
  },

  isAllowed: (role, key) => {
    // Admins keep full access and cannot be limited by this toggle system.
    if (!role || role === "admin") return true;

    const state = get();
    // While permissions are loading and we have no data, default to false
    // to avoid over-granting access.
    if (!state.isLoaded) return false;

    const current = state.permissions?.[role];
    if (!current) return false;
    return Boolean(current[key]);
  },

  setPermission: async (role, key, value) => {
    try {
      await axiosInstance.put("/permissions", { role, key, value });
      set((state) => {
        const nextForRole = {
          ...(state.permissions[role] || {}),
          [key]: value,
        };
        return {
          permissions: {
            ...state.permissions,
            [role]: nextForRole,
          },
        };
      });
    } catch (error) {
      console.error("Failed to update permission", error);
      throw error;
    }
  },

  resetPermissions: async () => {
    try {
      const res = await axiosInstance.post("/permissions/reset");
      const { definitions, values } = res.data || {};
      set({
        roleDefinitions: definitions || {},
        permissions: values || {},
        isLoaded: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to reset permissions", error);
      throw error;
    }
  },
}));
