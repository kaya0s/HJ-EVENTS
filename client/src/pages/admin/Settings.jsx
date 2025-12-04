import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, SlidersHorizontal, RotateCcw } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuthStore } from "../../store/useAuthStore";
import {
  usePermissionsStore,
  rolePermissionDefinitions,
} from "../../store/usePermissionsStore";
import toast from "react-hot-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  // Select each field separately to avoid creating a new object on every render,
  // which can cause unnecessary effects and render loops.
  const permissions = usePermissionsStore((state) => state.permissions);
  const isLoading = usePermissionsStore((state) => state.isLoading);
  const error = usePermissionsStore((state) => state.error);
  const isLoaded = usePermissionsStore((state) => state.isLoaded);
  const initialize = usePermissionsStore((state) => state.initialize);
  const setPermission = usePermissionsStore((state) => state.setPermission);
  const resetPermissions = usePermissionsStore(
    (state) => state.resetPermissions
  );
  const [activeRole, setActiveRole] = useState("user");

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
    }
    initialize();
  }, [authUser?.role, navigate, initialize]);

  const roleEntries = useMemo(
    () => Object.entries(rolePermissionDefinitions),
    []
  );

  const handleToggle = async (roleKey, permissionKey, checked) => {
    try {
      await setPermission(roleKey, permissionKey, checked);
      toast.success(
        `${checked ? "Enabled" : "Disabled"} ${permissionKey
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()} for ${
          rolePermissionDefinitions[roleKey]?.label || roleKey
        }`
      );
      // Don't reload immediately - trust the optimistic update and server response
      // The state is already updated in setPermission
    } catch (error) {
      toast.error("Failed to update permission. Please try again.");
      console.error("Permission update error:", error);
      // Reload permissions on error to revert to server state
      await initialize(true);
    }
  };

  const handleReset = async () => {
    try {
      await resetPermissions();
      toast.success("Permissions restored to defaults");
      // Reload permissions to ensure consistency
      await initialize(true);
    } catch (error) {
      toast.error("Failed to reset permissions. Please try again.");
      console.error("Permission reset error:", error);
    }
  };

  const activeRoleConfig = rolePermissionDefinitions?.[activeRole];

  if (authUser?.role !== "admin") {
    return null;
  }

  if (isLoading && !isLoaded) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!activeRoleConfig) {
    return (
      <div className="min-h-screen bg-base-100">
        <AdminSidebar />
        <main className="lg:ml-20 p-6 transition-all duration-300 flex items-center justify-center">
          <div className="max-w-lg text-center space-y-4">
            <h1 className="text-2xl font-bold">Permissions not loaded</h1>
            <p className="text-base-content/70">
              {error
                ? error
                : "No role definitions are available from the server. Please try refreshing the page or check the server logs."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <AdminSidebar />
      <main className="lg:ml-20 p-6 transition-all duration-300">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
                Roles & Permissions
              </p>
              <h1 className="text-3xl font-bold">Access Controls</h1>
              <p className="text-base-content/60 max-w-2xl">
                Enable or disable specific capabilities for each role. Changes
                apply instantly and update what users see in their portals.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost gap-2"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
              Reset to defaults
            </button>
          </header>

          <div className="flex flex-wrap gap-2">
            {roleEntries.map(([roleKey, config]) => (
              <button
                key={roleKey}
                type="button"
                className={`btn btn-sm ${
                  activeRole === roleKey ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setActiveRole(roleKey)}
              >
                {config.label}
              </button>
            ))}
          </div>

          <section className="space-y-4">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-1">
                      {activeRoleConfig.label}
                    </h2>
                    <p className="text-base-content/60">
                      {activeRoleConfig.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {activeRoleConfig.permissions.map((permission) => {
                const isEnabled = permissions?.[activeRole]?.[permission.key];
                return (
                  <div
                    key={permission.key}
                    className="card bg-base-100 border border-base-200"
                  >
                    <div className="card-body flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold">{permission.label}</h3>
                        <p className="text-sm text-base-content/60">
                          {permission.description}
                        </p>
                      </div>
                      <label className="flex items-center gap-3 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            isEnabled ? "text-success" : "text-base-content/60"
                          }`}
                        >
                          {isEnabled ? "Enabled" : "Disabled"}
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={Boolean(isEnabled)}
                          disabled={permission.readOnly}
                          onChange={(event) =>
                            handleToggle(
                              activeRole,
                              permission.key,
                              event.target.checked
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card bg-base-100 shadow">
            <div className="card-body space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary/10 p-3">
                  <Shield className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-semibold">Live Preview</h2>
                  <p className="text-sm text-base-content/60">
                    Snapshot of what each role currently sees.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Enabled Features</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleEntries.map(([roleKey, config]) => (
                      <tr key={roleKey}>
                        <td className="font-semibold">{config.label}</td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            {config.permissions.map((permission) => {
                              const active =
                                permissions?.[roleKey]?.[permission.key];
                              return (
                                <span
                                  key={permission.key}
                                  className={`badge ${
                                    active ? "badge-primary" : "badge-ghost"
                                  }`}
                                >
                                  {permission.label}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
