import { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  MoreVertical,
  Check,
} from "lucide-react";
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
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setCategoryMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <div className="relative w-64" ref={dropdownRef}>
              {/* Dropdown Button */}
              <button
                className="select select-bordered select-md w-full rounded-lg text-left flex items-center justify-between"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                type="button"
              >
                <span>{selectedCategory || "All Categories"}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {/* All Categories Option */}
                  <div
                    className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      setSelectedCategory("");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {!selectedCategory && (
                        <Check size={16} className="text-primary" />
                      )}
                      All Categories
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="divider my-0"></div>

                  {/* Category List */}
                  {categories.map((category) => (
                    <div key={category} className="group relative">
                      <div className="px-4 py-2 hover:bg-base-200 flex items-center justify-between">
                        {/* Category Name (clickable to filter) */}
                        <span
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsDropdownOpen(false);
                            setCategoryMenuOpen(null);
                          }}
                        >
                          {selectedCategory === category && (
                            <Check size={16} className="text-primary" />
                          )}
                          {category}
                        </span>

                        {/* Three-dot Menu Button */}
                        <button
                          className="p-1 hover:bg-base-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryMenuOpen(
                              categoryMenuOpen === category ? null : category,
                            );
                          }}
                          type="button"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      {/* Context Menu (Edit/Delete) */}
                      {categoryMenuOpen === category && (
                        <div className="absolute right-0 top-0 mt-8 mr-2 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 min-w-32">
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 rounded-t-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(category);
                              setCategoryMenuOpen(null);
                              setIsDropdownOpen(false);
                            }}
                            type="button"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-error rounded-b-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(category);
                              setCategoryMenuOpen(null);
                              setIsDropdownOpen(false);
                            }}
                            type="button"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Category Option at Bottom */}
                  <div className="divider my-0"></div>
                  <div
                    className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-2 text-primary font-medium"
                    onClick={() => {
                      setIsAddCategoryModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Plus size={16} />
                    Add New Category
                  </div>
                </div>
              )}
            </div>
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
