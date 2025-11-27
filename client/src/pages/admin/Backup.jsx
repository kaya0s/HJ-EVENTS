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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";

const Backup = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [backups, setBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  // Fetch all backups - wrapped in useCallback to prevent infinite loops
  const fetchBackups = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get("/backup");
      setBackups(data.backups || []);
    } catch (error) {
      console.error("Error fetching backups:", error);
      toast.error(error.response?.data?.message || "Failed to fetch backups");
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any props/state

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchBackups();
  }, [authUser, navigate, fetchBackups]); // Now includes fetchBackups

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
      console.error("Error creating backup:", error);
      toast.error(error.response?.data?.message || "Failed to create backup");
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
      console.error("Error downloading backup:", error);
      toast.error(error.response?.data?.message || "Failed to download backup");
    }
  };

  // Restore from existing backup
  const restoreBackup = async (backupId, backupName) => {
    const confirmed = window.confirm(
      `⚠️ WARNING: This will replace ALL current data with the backup "${backupName}".\n\nThis action cannot be undone. Are you absolutely sure you want to continue?`
    );

    if (!confirmed) return;

    // Double confirmation
    const doubleCheck = window.confirm(
      "This is your LAST CHANCE to cancel. Click OK to proceed with restore."
    );

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
      console.error("Error restoring backup:", error);
      toast.error(error.response?.data?.message || "Failed to restore backup");
    } finally {
      setRestoringId(null);
    }
  };

  // Delete backup
  const deleteBackup = async (backupId, backupName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the backup "${backupName}"?`
    );
    if (!confirmed) return;

    try {
      const { data } = await axiosInstance.delete(`/backup/${backupId}`);
      toast.success(data.message || "Backup deleted successfully");
      fetchBackups();
    } catch (error) {
      console.error("Error deleting backup:", error);
      toast.error(error.response?.data?.message || "Failed to delete backup");
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-screen bg-base-100">
      <AdminSidebar />
      <main className="lg:ml-20 p-6 transition-all duration-300">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Backup & Restore</h1>
            <p className="text-base-content/60">
              Create and manage database backups using MongoDB dump/restore.
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
                and more.
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
                        <th>Database</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => (
                        <tr key={backup._id}>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {formatDate(backup.createdAt)}
                              </span>
                              <span className="text-xs text-base-content/50">
                                {backup.filename}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-ghost">
                              {formatSize(backup.size)}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm text-base-content/70">
                              {backup.collections?.length > 0
                                ? `${backup.collections.length} collection(s)`
                                : "All"}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() =>
                                  restoreBackup(backup._id, backup.filename)
                                }
                                disabled={restoringId !== null}
                                className="btn btn-sm btn-warning gap-2"
                                title="Restore this backup"
                              >
                                {restoringId === backup._id ? (
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
                                  downloadBackup(backup._id, backup.filename)
                                }
                                className="btn btn-sm btn-ghost gap-2"
                                title="Download backup"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                              <button
                                onClick={() =>
                                  deleteBackup(backup._id, backup.filename)
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
              <p className="font-semibold">Backup Location</p>
              <p className="text-xs opacity-80">
                Backups are stored locally at: C:\backup_database\
              </p>
              <p className="text-xs opacity-80 mt-1">
                You can also download backups to save them externally for extra
                safety.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Backup;
