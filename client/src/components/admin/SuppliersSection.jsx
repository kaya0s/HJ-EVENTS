import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, X, MoreHorizontal } from "lucide-react";
import { useSupplierStore } from "../../store/useSupplierStore";
import SupplierModal from "./SupplierModal";
import { confirmDialog } from "../../utils/confirmDialog";

const SuppliersSection = () => {
  const {
    suppliers,
    categories,
    isLoading,
    fetchAllSuppliers,
    deleteSupplier,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useSupplierStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [categoryToEdit, setCategoryToEdit] = useState("");

  useEffect(() => {
    fetchAllSuppliers();
  }, [fetchAllSuppliers]);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    const supplier = suppliers.find((s) => s._id === supplierId);
    const supplierName = supplier?.name || "this supplier";

    const confirmed = await confirmDialog({
      title: "Delete Supplier",
      text: `Are you sure you want to delete "${supplierName}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmButtonClass: "btn-error",
      cancelButtonClass: "btn-outline",
      icon: "warning",
    });

    if (!confirmed) return;

    try {
      await deleteSupplier(supplierId);
    } catch {
      // Error already handled in store
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleEditCategory = (category) => {
    setCategoryToEdit(category);
    setEditCategoryName(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = await confirmDialog({
      title: "Delete Category",
      text: `Are you sure you want to delete "${category}"? This will remove all suppliers in this category.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmButtonClass: "btn-error",
      cancelButtonClass: "btn-outline",
      icon: "warning",
    });

    if (!confirmed) return;

    try {
      await deleteCategory(category);
    } catch (error) {
      // Error already handled in store
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold">Suppliers Management</h2>
        <button
          className="btn btn-primary"
          onClick={handleAddSupplier}
          type="button"
        >
          <Plus size={20} />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Category</span>
          </label>
          <div className="flex gap-2">
            <div className="w-64">
              <select
                className="select select-bordered select-md w-full rounded-lg"
                value={selectedCategory || "All Categories"}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value === "All Categories" ? "" : e.target.value,
                  )
                }
              >
                <option value="All Categories">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary transition-colors"
              onClick={() => setIsAddCategoryModalOpen(true)}
              type="button"
              title="Add Category"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="form-control w-full md:w-64">
          <label className="label">
            <span className="label-text">Search</span>
          </label>
          <div className="input-group flex">
            <input
              type="text"
              placeholder="Search suppliers..."
              className="input select-bordered select-md w-full focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="ml-2 btn btn-square hover:bg-gray-200">
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/60">No suppliers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => {
            return (
              <div
                key={supplier._id}
                className="card bg-base-100 shadow-lg border border-base-300"
              >
                {supplier.imageURL && (
                  <figure>
                    <img
                      src={supplier.imageURL}
                      alt={supplier.name}
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                )}
                <div className="card-body">
                  <h3 className="card-title">{supplier.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-primary badge-sm">
                      {supplier.category}
                    </span>
                    {/* Rating removed */}
                  </div>
                  {supplier.description && (
                    <p className="text-sm text-base-content/70 line-clamp-2">
                      {supplier.description}
                    </p>
                  )}
                  {supplier.priceRange && (
                    <p className="text-sm font-semibold">
                      Price: {supplier.priceRange}
                    </p>
                  )}
                  {supplier.contactInfo?.email && (
                    <p className="text-xs text-base-content/60">
                      {supplier.contactInfo.email}
                    </p>
                  )}
                  <div className="card-actions justify-end mt-4">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleEditSupplier(supplier)}
                      type="button"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn btn-sm btn-error btn-ghost"
                      onClick={() => handleDeleteSupplier(supplier._id)}
                      type="button"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        supplier={selectedSupplier}
      />

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Add New Category
              </h3>
              <button
                className="btn btn-sm btn-circle btn-ghost hover:bg-gray-100 transition-colors"
                onClick={() => setIsAddCategoryModalOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newCategoryName.trim()) {
                  const normalizedName = newCategoryName.trim();
                  addCategory(normalizedName);
                  setNewCategoryName("");
                  setIsAddCategoryModalOpen(false);
                }
              }}
              className="space-y-6"
            >
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-700 font-medium">
                    Category Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Enter category name"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  className="btn btn-sm btn-outline border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditCategoryModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Category</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost hover:bg-gray-100 transition-colors"
                onClick={() => setIsEditCategoryModalOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editCategoryName.trim()) {
                  const normalizedName = editCategoryName.trim();
                  updateCategory(categoryToEdit, normalizedName);
                  setIsEditCategoryModalOpen(false);
                  setCategoryToEdit("");
                  setEditCategoryName("");
                }
              }}
              className="space-y-6"
            >
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-700 font-medium">
                    Category Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Enter category name"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  className="btn btn-sm btn-outline border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsEditCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersSection;
