import { useState, useRef, useEffect } from "react";
import { User, Mail, Lock, Camera, Phone, MapPin } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { usePermissionsStore } from "../../store/usePermissionsStore";
import toast from "react-hot-toast";

const Profile = () => {
  const { authUser, updateProfile, changePassword, isUpdatingProfile } =
    useAuthStore();
  const roleKey = authUser?.role === "supplier" ? "supplier" : "user";
  const permissionKey =
    authUser?.role === "supplier" ? "manageProducts" : "updateProfile";
  const permsLoaded = usePermissionsStore((state) => state.isLoaded);
  const isAllowed = usePermissionsStore((state) => state.isAllowed);
  const canEditProfile =
    !!authUser && permsLoaded && isAllowed(roleKey, permissionKey);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    profilePic: null,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const openEditModal = () => {
    if (!canEditProfile) {
      toast.error("Profile editing is disabled by your admin.");
      return;
    }
    setEditForm({
      fullName: authUser?.fullName || "",
      email: authUser?.email || "",
      phone: authUser?.phone || "",
      address: authUser?.address || "",
      profilePic: null,
    });
    setIsEditModalOpen(true);
  };

  const openPasswordModal = () => {
    if (!canEditProfile) {
      toast.error("Profile editing is disabled by your admin.");
      return;
    }
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsPasswordModalOpen(true);
  };

  const handleProfilePicClick = () => {
    if (!canEditProfile) {
      toast.error("Profile editing is disabled by your admin.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!canEditProfile) {
      toast.error("Profile editing is disabled by your admin.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      await updateProfile(formData);
    } catch (error) {
      console.error("Failed to update profile picture:", error);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!canEditProfile) {
      toast.error("Profile editing is disabled by your admin.");
      return;
    }
    const formData = new FormData();
    formData.append("fullName", editForm.fullName.trim());
    formData.append("email", editForm.email.trim());
    if (editForm.phone) formData.append("phone", editForm.phone.trim());
    if (editForm.address) formData.append("address", editForm.address.trim());
    if (editForm.profilePic) {
      formData.append("profilePic", editForm.profilePic);
    }

    try {
      await updateProfile(formData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!canEditProfile) {
      toast.error("Profile editing is disabled by your admin.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setIsPasswordModalOpen(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
    }
  };

  useEffect(() => {
    if (!canEditProfile) {
      setIsEditModalOpen(false);
      setIsPasswordModalOpen(false);
    }
  }, [canEditProfile]);

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-2">
            My Profile
          </h1>
          <p className="text-base-content/60">
            Manage your account information
          </p>
        </div>

        {!canEditProfile && (
          <div className="alert alert-warning mb-6">
            <p className="text-sm">
              Profile edits are temporarily disabled by your administrator.
            </p>
          </div>
        )}

        {/* Profile Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                  <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center overflow-hidden">
                    {authUser?.profilePic ? (
                      <img
                        src={authUser.profilePic}
                        alt={authUser?.fullName || "Profile"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-bold text-primary">
                        {authUser?.fullName
                          ? authUser.fullName[0].toUpperCase()
                          : "?"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Upload overlay */}
                <button
                  type="button"
                  onClick={handleProfilePicClick}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
              </div>

              <h2 className="text-2xl font-bold mt-4">{authUser?.fullName}</h2>
              <div className="badge badge-primary badge-outline mt-2">
                Active User
              </div>
            </div>

            <div className="divider"></div>

            {/* Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </h3>

              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <div className="input-group">
                  <span className="bg-base-200">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    value={authUser?.fullName || ""}
                    readOnly
                    className="input input-bordered w-full bg-base-200"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email Address</span>
                </label>
                <div className="input-group">
                  <span className="bg-base-200">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    value={authUser?.email || ""}
                    readOnly
                    className="input input-bordered w-full bg-base-200"
                  />
                </div>
              </div>

              {/* Phone */}
              {authUser?.phone && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Phone</span>
                  </label>
                  <div className="input-group">
                    <span className="bg-base-200">
                      <Phone className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={authUser.phone}
                      readOnly
                      className="input input-bordered w-full bg-base-200"
                    />
                  </div>
                </div>
              )}

              {/* Address */}
              {authUser?.address && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Address</span>
                  </label>
                  <div className="input-group">
                    <span className="bg-base-200">
                      <MapPin className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={authUser.address}
                      readOnly
                      className="input input-bordered w-full bg-base-200"
                    />
                  </div>
                </div>
              )}

              <div className="divider"></div>

              {/* Actions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security
                </h3>

                <button
                  type="button"
                  onClick={openPasswordModal}
                  className="btn btn-outline btn-primary w-full"
                  disabled={!canEditProfile}
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </button>

                <button
                  type="button"
                  onClick={openEditModal}
                  className="btn btn-outline w-full"
                  disabled={!canEditProfile}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && canEditProfile && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Edit Profile</h3>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, fullName: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Address</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Profile Picture</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      profilePic: e.target.files?.[0] || null,
                    }))
                  }
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdatingProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${
                    isUpdatingProfile ? "btn-disabled" : ""
                  }`}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
          <label
            className="modal-backdrop"
            onClick={() => setIsEditModalOpen(false)}
          />
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && canEditProfile && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Change Password</h3>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isUpdatingProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary ${
                    isUpdatingProfile ? "btn-disabled" : ""
                  }`}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
          <label
            className="modal-backdrop"
            onClick={() => setIsPasswordModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Profile;
