import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Loader, Save, CalendarX, MinusCircle } from "lucide-react";
import SupplierSidebar from "../../components/supplier/SupplierSidebar";
import { useAuthStore } from "../../store/useAuthStore";
import { useSupplierDashboardStore } from "../../store/useSupplierDashboardStore";

const Profile = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const {
    profile,
    isLoadingProfile,
    isUpdatingProfile,
    fetchSupplierProfile,
    updateSupplierProfile,
  } = useSupplierDashboardStore();

  const [formState, setFormState] = useState({
    name: "",
    description: "",
    priceRange: "",
    contactInfo: {
      phone: "",
      address: "",
      email: "",
    },
    unavailableDates: [],
  });
  const [newUnavailableDate, setNewUnavailableDate] = useState("");

  useEffect(() => {
    if (authUser?.role !== "supplier") {
      navigate("/");
      return;
    }
    fetchSupplierProfile();
  }, [authUser, navigate, fetchSupplierProfile]);

  useEffect(() => {
    if (profile) {
      setFormState({
        name: profile.name || "",
        description: profile.description || "",
        priceRange: profile.priceRange || "",
        contactInfo: {
          phone: profile.contactInfo?.phone || "",
          address: profile.contactInfo?.address || "",
          email:
            profile.contactInfo?.email ||
            profile.user?.email ||
            authUser?.email ||
            "",
        },
        unavailableDates: Array.isArray(profile.unavailableDates)
          ? profile.unavailableDates
          : [],
      });
      setNewUnavailableDate("");
    }
  }, [profile, authUser]);

  if (authUser?.role !== "supplier") {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contactInfo.")) {
      const field = name.split(".")[1];
      setFormState((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formState.name,
      description: formState.description,
      priceRange: formState.priceRange,
      contactInfo: {
        phone: formState.contactInfo.phone,
        address: formState.contactInfo.address,
        email: formState.contactInfo.email,
      },
      unavailableDates: formState.unavailableDates,
    };
    await updateSupplierProfile(payload);
  };

  const handleAddUnavailableDate = () => {
    if (!newUnavailableDate) return;
    const formatted = dayjs(newUnavailableDate).format("YYYY-MM-DD");
    if (formatted === "Invalid Date") {
      return;
    }
    setFormState((prev) => {
      if (prev.unavailableDates.includes(formatted)) {
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
    setFormState((prev) => ({
      ...prev,
      unavailableDates: prev.unavailableDates.filter((item) => item !== date),
    }));
  };

  return (
    <div className="min-h-screen bg-base-100">
      <SupplierSidebar />
      <main className="lg:ml-64 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <header>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-base-content/60">
              Update your supplier details and contact information to keep the
              coordination team informed.
            </p>
          </header>

          {isLoadingProfile && !profile ? (
            <div className="flex items-center justify-center py-24">
              <Loader className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="card bg-base-100 shadow-lg"
            >
              <div className="card-body space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Supplier Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Your brand or team name"
                    required
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Price Range</span>
                  </label>
                  <input
                    type="text"
                    name="priceRange"
                    value={formState.priceRange}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="e.g., PHP 5,000 - 15,000"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    name="description"
                    value={formState.description}
                    onChange={handleChange}
                    className="textarea textarea-bordered min-h-32 w-full"
                    placeholder="Share more details about your services, specialties, and experience."
                  />
                </div>

                <div className="divider">Contact Information</div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="contactInfo.email"
                    value={formState.contactInfo.email}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="you@example.com"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/50">
                      This is the address we will use for notifications.
                    </span>
                  </label>
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Phone</span>
                  </label>
                  <input
                    type="text"
                    name="contactInfo.phone"
                    value={formState.contactInfo.phone}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="+63 900 000 0000"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Address</span>
                  </label>
                  <input
                    type="text"
                    name="contactInfo.address"
                    value={formState.contactInfo.address}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="City, Province"
                  />
                </div>

                <div className="divider">Availability</div>
                <div className="space-y-3">
                  <div className="alert bg-base-200">
                    <CalendarX className="w-5 h-5 text-primary" />
                    <span className="text-sm text-base-content/70">
                      Add dates when you are unavailable so admins and clients
                      avoid booking you on those days.
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
                  {formState.unavailableDates.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formState.unavailableDates.map((date) => (
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

                <div className="divider">Account</div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Login Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered bg-base-200 cursor-not-allowed w-full"
                    value={profile?.user?.email || formState.contactInfo.email}
                    readOnly
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/50">
                      Contact support to change your login email.
                    </span>
                  </label>
                </div>

                <div className="card-actions justify-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
