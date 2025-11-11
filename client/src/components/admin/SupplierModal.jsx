import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { useSupplierStore } from "../../store/useSupplierStore";

const SupplierModal = ({ isOpen, onClose, supplier = null }) => {
  const { createSupplier, updateSupplier } = useSupplierStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    priceRange: "",
    contactInfo: {
      phone: "",
      email: "",
      address: "",
    },
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    "Food",
    "catering",
    "Decoration",
    "Photography",
    "Videography",
    "Music",
    "Florist",
  ];

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          name: supplier.name || "",
          category: supplier.category || "",
          description: supplier.description || "",
          priceRange: supplier.priceRange || "",
          contactInfo: {
            phone: supplier.contactInfo?.phone || "",
            email: supplier.contactInfo?.email || "",
            address: supplier.contactInfo?.address || "",
          },
        });
        setImagePreview(supplier.imageURL || null);
      } else {
        setFormData({
          name: "",
          category: "",
          description: "",
          priceRange: "",
          contactInfo: {
            phone: "",
            email: "",
            address: "",
          },
        });
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [isOpen, supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contactInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for FormData - flatten nested contactInfo
      const supplierData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        priceRange: formData.priceRange,
        "contactInfo[phone]": formData.contactInfo.phone,
        "contactInfo[email]": formData.contactInfo.email,
        "contactInfo[address]": formData.contactInfo.address,
      };

      if (supplier) {
        await updateSupplier(supplier._id, supplierData, imageFile);
      } else {
        await createSupplier(supplierData, imageFile);
      }
      onClose();
    } catch {
      // Error already handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">
            {supplier ? "Edit Supplier" : "Add New Supplier"}
          </h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Supplier Name *</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Category */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Category *</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              rows="3"
            />
          </div>

          {/* Price Range */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Price Range</span>
            </label>
            <input
              type="text"
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="e.g., $500 - $1000"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Phone</span>
              </label>
              <input
                type="text"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <input
              type="text"
              name="contactInfo.address"
              value={formData.contactInfo.address}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          {/* Image Upload */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Image</span>
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-base-300">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <label className="btn btn-outline btn-sm cursor-pointer">
                <Upload size={16} />
                <span className="ml-2">
                  {imageFile ? "Change Image" : "Upload Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : supplier
                ? "Update Supplier"
                : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default SupplierModal;
