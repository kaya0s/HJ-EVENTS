import { useEffect, useState, useCallback } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Loader,
  Download,
  RotateCcw,
  Database,
  AlertCircle,
  Clock,
  Trash2,
  HardDrive,
  Cloud,
  ShieldOff,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import { confirmDialog } from "../../utils/confirmDialog";

const DisabledOverlay = ({ onBack }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Blurred background */}
    <div className="absolute inset-0 bg-base-100/70 backdrop-blur-sm" />
    {/* Centered card */}
    <div className="card max-w-lg w-full mx-4 shadow-xl border border-base-300 bg-base-200/90 relative z-10">
      <div className="card-body items-center text-center gap-4">
        <ShieldOff className="w-12 h-12 text-error" />
        <h1 className="text-2xl font-bold text-error">
          Backup is Disabled in Production
        </h1>
        <p className="text-base-content/70">
          This backup server does not have{" "}
          <span className="font-medium">mongodump</span> installed or backup
          features are intentionally disabled in production.
        </p>
        <p className="text-base-content/60">
          Please contact your developer or system administrator to enable or
          troubleshoot backups on this server.
        </p>
        <p className="text-base-content/50 text-xs italic mt-2">
          (Error: 403 Forbidden)
        </p>
        <button
          className="btn btn-outline btn-primary mt-4 gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  </div>
);

const Backup = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [backups, setBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [disabledInProduction, setDisabledInProduction] = useState(false);
  const [disableMessage, setDisableMessage] = useState("");

  // Fetch all backups - wrapped in useCallback to prevent infinite loops
  const fetchBackups = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get("/backup");
      setBackups(data.backups || []);
    } catch (error) {
      if (error?.response?.status === 403) {
        setDisabledInProduction(true);
        setDisableMessage(
          error.response.data?.message ||
            "Backup feature is disabled for admin in production."
        );
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch backups");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchBackups();
  }, [authUser, navigate, fetchBackups]);

  if (authUser?.role !== "admin") {
    return null;
  }

  // Create new backup
  const createBackup = async () => {
    setIsCreating(true);
    try {
      const { data } = await axiosInstance.post("/backup/create");
      toast.success(data.message || "Backup created successfully");
      fetchBackups();
    } catch (error) {
      if (error?.response?.status === 403) {
        setDisabledInProduction(true);
        setDisableMessage(
          error.response.data?.message ||
            "Backup feature is disabled for admin in production."
        );
      } else {
        toast.error(error.response?.data?.message || "Failed to create backup");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Download backup file
  const downloadBackup = async (backupId, filename) => {
    try {
      toast.loading("Preparing download...");

      const response = await axiosInstance.get(`/backup/download/${backupId}`, {
        responseType: "blob",
      });

      // Create blob from response
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `backup-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success("Backup downloaded successfully");
    } catch (error) {
      toast.dismiss();
      if (error?.response?.status === 403) {
        setDisabledInProduction(true);
        setDisableMessage(
          error.response.data?.message ||
            "Backup feature is disabled for admin in production."
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to download backup"
        );
      }
    }
  };

  // Restore from existing backup
  const restoreBackup = async (backupId, backupName) => {
    const confirmed = await confirmDialog({
      title: "⚠️ WARNING: Restore Backup",
      html: `
        <div class="text-left space-y-3">
          <p class="text-base font-semibold text-error">This will replace ALL current data with the backup:</p>
          <div class="bg-base-200 rounded-lg p-4">
            <p class="font-mono text-sm">${backupName}</p>
          </div>
          <p class="text-base text-error font-semibold">This action cannot be undone!</p>
          <p class="text-sm">Are you absolutely sure you want to continue?</p>
        </div>
      `,
      confirmText: "Yes, Restore",
      cancelText: "Cancel",
      confirmButtonClass: "btn-error",
      cancelButtonClass: "btn-outline",
      icon: "warning",
    });

    if (!confirmed) return;

    // Double confirmation
    const doubleCheck = await confirmDialog({
      title: "Final Confirmation",
      text: "This is your LAST CHANCE to cancel. Click OK to proceed with restore.",
      confirmText: "Proceed with Restore",
      cancelText: "Cancel",
      confirmButtonClass: "btn-error",
      cancelButtonClass: "btn-outline",
      icon: "error",
    });

    if (!doubleCheck) return;

    setRestoringId(backupId);

    try {
      const { data } = await axiosInstance.post("/backup/restore", {
        backupId,
      });
      toast.success(data.message || "Database restored successfully");

      // Reload page after a short delay to reflect restored data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      if (error?.response?.status === 403) {
        setDisabledInProduction(true);
        setDisableMessage(
          error.response.data?.message ||
            "Backup feature is disabled for admin in production."
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to restore backup"
        );
      }
    } finally {
      setRestoringId(null);
    }
  };

  // Delete backup
  const deleteBackup = async (backupId, backupName) => {
    const confirmed = await confirmDialog({
      title: "Delete Backup",
      text: `Are you sure you want to delete the backup "${backupName}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmButtonClass: "btn-error",
      cancelButtonClass: "btn-outline",
      icon: "warning",
    });

    if (!confirmed) return;

    try {
      const { data } = await axiosInstance.delete(`/backup/${backupId}`);
      toast.success(data.message || "Backup deleted successfully");
      fetchBackups();
    } catch (error) {
      if (error?.response?.status === 403) {
        setDisabledInProduction(true);
        setDisableMessage(
          error.response.data?.message ||
            "Backup feature is disabled for admin in production."
        );
      } else {
        toast.error(error.response?.data?.message || "Failed to delete backup");
      }
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes) => {
    const size = parseInt(bytes);
    if (!size || size === 0) return "0 B";
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-base-100 relative">
      <AdminSidebar />
      <main className="lg:ml-20 p-6 transition-all duration-300">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Backup & Restore</h1>
            <p className="text-base-content/60">
              Create and manage database backups stored in Google Drive.
            </p>
          </header>

          {/* Warning Alert */}
          <div className="alert alert-warning shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <h3 className="font-bold">Important Information</h3>
              <p className="text-sm">
                Restoring a backup will replace ALL current data. Always create
                a new backup before restoring to prevent data loss.
              </p>
            </div>
          </div>

          {/* Create Backup Section */}
          <section className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Create New Backup
              </h2>
              <p className="text-sm text-base-content/60 mb-4">
                Creates a complete backup using MongoDB's mongodump utility.
                Includes all collections: bookings, users, suppliers, packages,
                and more. Automatically uploaded to Google Drive.
              </p>
              <button
                onClick={createBackup}
                disabled={isCreating}
                className="btn btn-primary w-full sm:w-auto gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Create Backup Now
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Backup History Section */}
          <section className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-primary" />
                  Backup History
                </h2>
                <button
                  onClick={fetchBackups}
                  disabled={isLoading}
                  className="btn btn-ghost btn-sm gap-2"
                  title="Refresh"
                >
                  <RotateCcw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-base-content/60 mt-3">
                    Loading backups...
                  </p>
                </div>
              ) : backups.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                  <p className="text-base-content/60 font-medium">
                    No backups available
                  </p>
                  <p className="text-sm text-base-content/50 mt-1">
                    Create your first backup to get started
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>
                          <Clock className="w-4 h-4 inline mr-2" />
                          Created
                        </th>
                        <th>Size</th>
                        <th>Storage</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => (
                        <tr key={backup.id}>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {formatDate(backup.createdTime)}
                              </span>
                              <span className="text-xs text-base-content/50">
                                {backup.name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-ghost">
                              {formatSize(backup.size)}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Cloud className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-base-content/70">
                                Google Drive
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() =>
                                  restoreBackup(backup.id, backup.name)
                                }
                                disabled={restoringId !== null}
                                className="btn btn-sm btn-warning gap-2"
                                title="Restore this backup"
                              >
                                {restoringId === backup.id ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Restoring...
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="w-4 h-4" />
                                    Restore
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  downloadBackup(backup.id, backup.name)
                                }
                                className="btn btn-sm btn-ghost gap-2"
                                title="Download backup"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                              <button
                                onClick={() =>
                                  deleteBackup(backup.id, backup.name)
                                }
                                className="btn btn-sm btn-ghost btn-error gap-2"
                                title="Delete backup"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Info Section */}
          <div className="alert alert-info shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Backup Storage</p>
              <p className="text-xs opacity-80">
                All backups are securely stored in your connected Google Drive
                account.
              </p>
              <p className="text-xs opacity-80 mt-1">
                You can download backups anytime to save them locally for
                additional safety.
              </p>
            </div>
          </div>
        </div>
      </main>
      {disabledInProduction && <DisabledOverlay onBack={handleBack} />}
    </div>
  );
};

export default Backup;
