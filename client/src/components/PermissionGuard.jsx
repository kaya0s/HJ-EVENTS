import { usePermissionsStore } from "../store/usePermissionsStore";
import { AlertCircle } from "lucide-react";

/**
 * PermissionGuard component that blocks access to features when permissions are disabled.
 * Shows a consistent message: "This feature is disabled by the admin."
 */
const PermissionGuard = ({
  role,
  permission,
  children,
  fallback = null,
  showMessage = true,
}) => {
  const permsLoaded = usePermissionsStore((state) => state.isLoaded);
  const isAllowed = usePermissionsStore((state) => state.isAllowed);

  // If permissions aren't loaded yet, show loading state
  if (!permsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  // Check if user has the required permission
  const hasPermission = isAllowed(role, permission);

  // If user doesn't have permission, show the disabled message
  if (!hasPermission) {
    if (!showMessage) return fallback;

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-4 bg-base-100 border border-base-200 rounded-3xl p-8 shadow-lg">
          <div className="flex justify-center">
            <AlertCircle className="w-16 h-16 text-warning" />
          </div>
          <h1 className="text-2xl font-bold">Feature Disabled</h1>
          <p className="text-base-content/70">
            This feature is disabled by the admin.
          </p>
        </div>
      </div>
    );
  }

  // User has permission, render children
  return children;
};

export default PermissionGuard;
