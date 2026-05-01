import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { usePackageStore } from "../../store/usePackageStore";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ExternalSupplierSettings from "../../components/admin/ExternalSupplierSettings";
import { confirmDialog } from "../../utils/confirmDialog";
import {
  Loader,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const EmptyImage = "https://via.placeholder.com/640x360?text=No+Image";

const Packages = ({ showSidebar = true }) => {
  const { authUser } = useAuthStore();
  const {
    packages,
    isLoadingPackages,
    isSavingPackage,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    toggleAvailability,
  } = usePackageStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });

  useEffect(() => {
    if (authUser?.role !== "admin") return;
    fetchPackages();
  }, [authUser, fetchPackages]);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: "", image: null });
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };
  const openEdit = (pkg) => {
    setEditing(pkg);
    setForm({
      name: pkg.name || "",
      description: pkg.description || "",
      price: String(pkg.price ?? ""),
      image: null,
    });
    setIsModalOpen(true);
  };
  const onClose = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("description", form.description.trim());
    fd.append("price", form.price);
    if (form.image) fd.append("image", form.image);
    if (editing) {
      await updatePackage(editing._id, fd);
    } else {
      await createPackage(fd);
    }
    onClose();
  };

  const handleDeletePackage = async (pkg) => {
    const confirmed = await confirmDialog({
      title: "Delete Package",
      text: `Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      confirmButtonClass: "btn-error",
    });
    if (!confirmed) return;

    await deletePackage(pkg._id);
  };

  const totalCount = packages.length;
  const enabledCount = useMemo(
    () => packages.filter((p) => p.isAvailable).length,
    [packages],
  );

  const content = (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Packages</h1>
        <p className="text-base-content/60">
          Create, edit, and manage packages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Packages</div>
            <div className="stat-value">{totalCount}</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Enabled</div>
            <div className="stat-value text-primary">{enabledCount}</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Disabled</div>
            <div className="stat-value text-warning">
              {totalCount - enabledCount}
            </div>
          </div>
        </div>
      </div>

      <ExternalSupplierSettings />

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title">Manage Packages</h2>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={openCreate}
            >
              <Plus className="mr-1" size={16} />
              New Package
            </button>
          </div>

          {isLoadingPackages ? (
            <div className="text-center py-12">
              <Loader className="animate-spin mx-auto" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <img
                                src={pkg.imageURL || EmptyImage}
                                alt={pkg.name}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{pkg.name}</div>
                            <div className="text-sm opacity-70 line-clamp-1">
                              {pkg.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>₱{Number(pkg.price).toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {pkg.isAvailable ? (
                            <span className="badge badge-success badge-sm">
                              Enabled
                            </span>
                          ) : (
                            <span className="badge badge-ghost badge-sm">
                              Disabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              toggleAvailability(pkg._id, !pkg.isAvailable)
                            }
                            title={pkg.isAvailable ? "Disable" : "Enable"}
                          >
                            {pkg.isAvailable ? <ToggleRight /> : <ToggleLeft />}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEdit(pkg)}
                          >
                            <Edit />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() => handleDeletePackage(pkg)}
                          >
                            <Trash2 />
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
      </div>
    </div>
  );

  const modal = isModalOpen ? (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {editing ? "Edit Package" : "New Package"}
        </h3>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full min-h-24"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Price (₱)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input input-bordered w-full"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Image</span>
              </label>
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    image: e.target.files?.[0] || null,
                  }))
                }
              />
            </div>
          </div>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSavingPackage}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${
                isSavingPackage ? "btn-disabled" : ""
              }`}
              disabled={isSavingPackage}
            >
              {isSavingPackage ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
      <label className="modal-backdrop" onClick={onClose} />
    </div>
  ) : null;

  if (showSidebar) {
    return (
      <div className="min-h-screen bg-base-100">
        <AdminSidebar />
        <main className="lg:ml-64 p-6 transition-all duration-300">
          {content}
        </main>
        {modal}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {content}
      {modal}
    </div>
  );
};

export default Packages;
