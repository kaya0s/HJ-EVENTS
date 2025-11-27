import { create } from "zustand";

const STORAGE_KEY = "hj-permissions-v1";

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
      },
      {
        key: "submitRequests",
        label: "Submit booking requests",
        description: "Enables access to booking request forms and modals.",
      },
      {
        key: "updateProfile",
        label: "Update personal info",
        description:
          "Allows editing contact info and uploading profile pictures.",
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
      },
      {
        key: "manageProducts",
        label: "Manage services & availability",
        description:
          "Allow edits to supplier profile, pricing, and availability.",
      },
      {
        key: "generateReports",
        label: "Generate performance reports",
        description: "Shows reporting shortcuts in the supplier dashboard.",
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

const getStoredPermissions = () => {
  if (typeof window === "undefined") {
    return buildDefaultPermissions();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return buildDefaultPermissions();
    }
    const parsed = JSON.parse(raw);
    return {
      ...buildDefaultPermissions(),
      ...parsed,
    };
  } catch (error) {
    console.warn("Failed to parse stored permissions, using defaults.", error);
    return buildDefaultPermissions();
  }
};

const persistPermissions = (permissions) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
  } catch (error) {
    console.warn("Failed to persist permissions.", error);
  }
};

export const usePermissionsStore = create((set, get) => ({
  permissions: getStoredPermissions(),
  isAllowed: (role, key) => {
    if (!role || role === "admin") return true;
    const current = get().permissions?.[role];
    if (!current) return false;
    return Boolean(current[key]);
  },
  setPermission: (role, key, value) => {
    set((state) => {
      const nextPermissions = {
        ...state.permissions,
        [role]: { ...state.permissions[role], [key]: value },
      };
      persistPermissions(nextPermissions);
      return { permissions: nextPermissions };
    });
  },
  resetPermissions: () => {
    const defaults = buildDefaultPermissions();
    persistPermissions(defaults);
    set({ permissions: defaults });
  },
}));
