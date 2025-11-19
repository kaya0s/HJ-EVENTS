import { useState, useEffect } from "react";
import { Search, Star, Plus, Edit, Trash2 } from "lucide-react";
import { useSupplierStore } from "../../store/useSupplierStore";
import SupplierModal from "./SupplierModal";

const SuppliersSection = () => {
  const {
    suppliers,
    categories,
    isLoading,
    fetchAllSuppliers,
    deleteSupplier,
  } = useSupplierStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

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
    if (!confirm("Are you sure you want to delete this supplier?")) return;
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
          <select
            className="select select-bordered"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control w-full md:w-64">
          <label className="label">
            <span className="label-text">Search</span>
          </label>
          <div className="input-group flex">
            <input
              type="text"
              placeholder="Search suppliers..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
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
                    {supplier.rating > 0 && (
                      <div className="flex items-center gap-1 text-sm text-warning">
                        <Star size={16} className="fill-warning" />
                        <span>{supplier.rating}</span>
                      </div>
                    )}
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
    </div>
  );
};

export default SuppliersSection;
