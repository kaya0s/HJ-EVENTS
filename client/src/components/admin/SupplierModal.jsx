import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { X, Upload, CalendarX, MinusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useSupplierStore } from "../../store/useSupplierStore";

const categories = [
  "Food",
  "catering",
  "Decoration",
  "Photography",
  "Videography",
  "Music",
  "Florist",
];

const createInitialFormData = () => ({
  name: "",
  category: "",
  description: "",
  priceRange: "",
  accountEmail: "",
  accountPassword: "",
  accountConfirmPassword: "",
  accountFullName: "",
  unavailableDates: [],
  contactInfo: {
    phone: "",
    email: "",
    address: "",
    facebookPage: "",
  },
});

const SupplierModal = ({ isOpen, onClose, supplier = null }) => {
  const { createSupplier, updateSupplier } = useSupplierStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => createInitialFormData());
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newUnavailableDate, setNewUnavailableDate] = useState("");

  const requiresCredentials = !supplier || !supplier.user;

  useEffect(() => {
    if (!isOpen) return;

    if (supplier) {
      setFormData({
        name: supplier.name || "",
        category: supplier.category || "",
        description: supplier.description || "",
        priceRange: supplier.priceRange || "",
        accountEmail: supplier.contactInfo?.email || supplier.user?.email || "",
        accountPassword: "",
        accountConfirmPassword: "",
        accountFullName: supplier.user?.fullName || supplier.name || "",
        unavailableDates: Array.isArray(supplier.unavailableDates)
          ? supplier.unavailableDates
          : [],
        contactInfo: {
          phone: supplier.contactInfo?.phone || "",
          email: supplier.contactInfo?.email || supplier.user?.email || "",
          address: supplier.contactInfo?.address || "",
          facebookPage: supplier.contactInfo?.facebookPage || "", // ← Change here
        },
      });
      setImagePreview(supplier.imageURL || null);
    } else {
      setFormData(createInitialFormData());
      setImagePreview(null);
    }

    setImageFile(null);
    setNewUnavailableDate("");
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
      return;
    }

    if (name === "accountEmail") {
      setFormData((prev) => {
        const shouldSyncContactEmail =
          !prev.contactInfo.email ||
          prev.contactInfo.email === prev.accountEmail;
        return {
          ...prev,
          accountEmail: value,
          contactInfo: {
            ...prev.contactInfo,
            email: shouldSyncContactEmail ? value : prev.contactInfo.email,
          },
        };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleAddUnavailableDate = () => {
    if (!newUnavailableDate) return;
    const formatted = dayjs(newUnavailableDate).format("YYYY-MM-DD");
    if (formatted === "Invalid Date") {
      toast.error("Please select a valid date");
      return;
    }
    setFormData((prev) => {
      if (prev.unavailableDates.includes(formatted)) {
        toast.error("Date already added");
        return prev;
      }
      const updated = [...prev.unavailableDates, formatted].sort();
      return {
        ...prev,
        unavailableDates: updated,
      };
    });
    setNewUnavailableDate("");
  };

  const handleRemoveUnavailableDate = (date) => {
    setFormData((prev) => ({
      ...prev,
      unavailableDates: prev.unavailableDates.filter((item) => item !== date),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const accountEmail = formData.accountEmail.trim().toLowerCase();
      const accountFullName = (
        formData.accountFullName || formData.name
      ).trim();

      if (requiresCredentials) {
        if (!accountEmail) {
          toast.error("Supplier login email is required.");
          setIsSubmitting(false);
          return;
        }
        if (!formData.accountPassword || !formData.accountConfirmPassword) {
          toast.error("Password and confirmation are required.");
          setIsSubmitting(false);
          return;
        }
        if (formData.accountPassword.length < 6) {
          toast.error("Password must be at least 6 characters long.");
          setIsSubmitting(false);
          return;
        }
        if (formData.accountPassword !== formData.accountConfirmPassword) {
          toast.error("Passwords do not match.");
          setIsSubmitting(false);
          return;
        }
      }

      if (formData.accountPassword || formData.accountConfirmPassword) {
        if (formData.accountPassword !== formData.accountConfirmPassword) {
          toast.error("Passwords do not match.");
          setIsSubmitting(false);
          return;
        }
        if (formData.accountPassword && formData.accountPassword.length < 6) {
          toast.error("Password must be at least 6 characters long.");
          setIsSubmitting(false);
          return;
        }
      }

      const supplierData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        priceRange: formData.priceRange,
        "contactInfo[phone]": formData.contactInfo.phone,
        "contactInfo[email]": formData.contactInfo.email || accountEmail,
        "contactInfo[address]": formData.contactInfo.address,
        "contactInfo[facebookPage]": formData.contactInfo.facebookPage, // ← Change here
      };

      if (accountEmail) {
        supplierData.accountEmail = accountEmail;
      }
      if (accountFullName) {
        supplierData.accountFullName = accountFullName;
      }
      if (formData.accountPassword) {
        supplierData.accountPassword = formData.accountPassword;
      }
      supplierData.unavailableDates = formData.unavailableDates;

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
              placeholder="e.g., PHP 500 - 1,000"
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
                placeholder="Used for contact and login notifications"
              />
            </div>
          </div>

          {/* Facebook Page */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Facebook Page</span>
            </label>
            <input
              type="text"
              name="contactInfo.facebookPage" // ← Change here
              value={formData.contactInfo.facebookPage} // ← Change here
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="https://facebook.com/yourpage"
            />
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

          <div className="divider">Availability</div>
          <div className="space-y-3">
            <div className="alert bg-base-200">
              <CalendarX className="w-5 h-5 text-primary" />
              <span className="text-sm text-base-content/70">
                Add dates when this supplier is unavailable. Clients will see
                these dates marked as unavailable during booking.
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="date"
                className="input input-bordered w-full md:w-auto"
                value={newUnavailableDate}
                onChange={(e) => setNewUnavailableDate(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline md:w-auto"
                onClick={handleAddUnavailableDate}
                disabled={!newUnavailableDate}
              >
                Add Unavailable Date
              </button>
            </div>
            {formData.unavailableDates.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.unavailableDates.map((date) => (
                  <span key={date} className="badge badge-outline gap-2">
                    {dayjs(date).format("MMM DD, YYYY")}
                    <button
                      type="button"
                      onClick={() => handleRemoveUnavailableDate(date)}
                      className="btn btn-ghost btn-xs px-1"
                      aria-label={`Remove ${date}`}
                    >
                      <MinusCircle size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/60">
                No unavailable dates set.
              </p>
            )}
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

          <div className="divider" />

          {/* Supplier Account */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Supplier Account</h4>
            <p className="text-sm text-base-content/60 mb-4">
              {requiresCredentials
                ? "Provide login credentials so the supplier can access their dashboard."
                : "Update the supplier's login credentials. Leave the password fields blank to keep the current password."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Login Email *</span>
                </label>
                <input
                  type="email"
                  name="accountEmail"
                  value={formData.accountEmail}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required={requiresCredentials}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    {supplier ? "New Password" : "Password *"}
                  </span>
                </label>
                <input
                  type="password"
                  name="accountPassword"
                  value={formData.accountPassword}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder={supplier ? "Leave blank to keep current" : ""}
                  required={requiresCredentials}
                  minLength={requiresCredentials ? 6 : undefined}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    {supplier ? "Confirm New Password" : "Confirm Password *"}
                  </span>
                </label>
                <input
                  type="password"
                  name="accountConfirmPassword"
                  value={formData.accountConfirmPassword}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder={supplier ? "Leave blank to keep current" : ""}
                  required={requiresCredentials}
                  minLength={requiresCredentials ? 6 : undefined}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Account Name</span>
                </label>
                <input
                  type="text"
                  name="accountFullName"
                  value={formData.accountFullName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Name shown in the supplier portal"
                />
              </div>
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
