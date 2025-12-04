import { create } from "zustand";
import axiosInstance from "../lib/axios";

// Static UI structure: all permissions are defined here.
// Only the boolean values live in the database.
export const rolePermissionDefinitions = {
  user: {
    label: "Normal User",
    description: "Controls what clients can do in the self-service portal.",
    permissions: [
      {
        key: "viewBookings",
        label: "View bookings",
        description:
          "Allows access to the My Bookings page and related widgets.",
        defaultValue: true,
      },
      {
        key: "submitRequests",
        label: "Submit booking requests",
        description: "Enables access to booking request forms and modals.",
        defaultValue: true,
      },
      {
        key: "updateProfile",
        label: "Update personal info",
        description:
          "Allows editing contact info and uploading profile pictures.",
        defaultValue: true,
      },
    ],
  },
  supplier: {
    label: "Supplier",
    description: "Controls actions available in the supplier portal.",
    permissions: [
      {
        key: "viewBookings",
        label: "View assigned bookings",
        description:
          "Access dashboards and tables that list assigned weddings.",
        defaultValue: true,
      },
      {
        key: "manageProducts",
        label: "Manage services & availability",
        description:
          "Allow edits to supplier profile, pricing, and availability.",
        defaultValue: true,
      },
      {
        key: "generateReports",
        label: "Generate performance reports",
        description: "Shows reporting shortcuts in the supplier dashboard.",
        defaultValue: true,
      },
    ],
  },
  admin: {
    label: "Admin",
    description: "Read-only overview of system-wide permissions.",
    permissions: [
      {
        key: "manageSystem",
        label: "Manage system",
        description: "Admins always keep full access and cannot be limited.",
        readOnly: true,
        defaultValue: true,
      },
    ],
  },
};

const buildDefaultPermissions = () => {
  const defaults = {};
  Object.entries(rolePermissionDefinitions).forEach(([role, config]) => {
    defaults[role] = {};
    config.permissions.forEach((permission) => {
      const defaultValue =
        permission.defaultValue !== undefined ? permission.defaultValue : true;
      defaults[role][permission.key] = defaultValue;
    });
  });
  return defaults;
};

export const usePermissionsStore = create((set, get) => ({
  // Map of role -> { [key]: boolean }, initialised from static defaults.
  permissions: buildDefaultPermissions(),
  isLoading: false,
  isLoaded: false,
  error: null,

  // Load boolean overrides from the server and merge with static defaults.
  initialize: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/permissions");
      const { values, error } = res.data || {};
      const merged = buildDefaultPermissions();

      if (values && typeof values === "object") {
        Object.entries(values).forEach(([role, roleMap]) => {
          if (!merged[role]) merged[role] = {};
          Object.entries(roleMap || {}).forEach(([key, value]) => {
            merged[role][key] = Boolean(value);
          });
        });
      }

      set({
        permissions: merged,
        isLoading: false,
        isLoaded: true,
        error: error || null,
      });
    } catch (error) {
      console.error("Failed to load permissions from server", error);

      if (error.response?.status === 401) {
        // Logged-out users don't need permissions; keep defaults.
        set({
          isLoading: false,
          isLoaded: true,
          error: null,
        });
        return;
      }

      set({
        isLoading: false,
        isLoaded: true,
        error: error.response?.data?.message || error.message,
      });
    }
  },

  isAllowed: (role, key) => {
    // Admins keep full access and cannot be limited by this toggle system.
    if (!role || role === "admin") return true;

    const current = get().permissions?.[role];
    if (!current) return false;
    return Boolean(current[key]);
  },

  setPermission: async (role, key, value) => {
    // Optimistic update
    set((state) => ({
      permissions: {
        ...state.permissions,
        [role]: {
          ...(state.permissions[role] || {}),
          [key]: value,
        },
      },
    }));

    try {
      await axiosInstance.put("/permissions", { role, key, value });
    } catch (error) {
      console.error("Failed to update permission", error);
      // On failure, revert to previous value by reloading from server next time.
      set({ isLoaded: false });
      throw error;
    }
  },

  resetPermissions: async () => {
    try {
      const res = await axiosInstance.post("/permissions/reset");
      const { values } = res.data || {};

      const merged = buildDefaultPermissions();
      if (values && typeof values === "object") {
        Object.entries(values).forEach(([role, roleMap]) => {
          if (!merged[role]) merged[role] = {};
          Object.entries(roleMap || {}).forEach(([key, value]) => {
            merged[role][key] = Boolean(value);
          });
        });
      }

      set({
        permissions: merged,
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
