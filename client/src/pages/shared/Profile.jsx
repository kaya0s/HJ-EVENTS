import { User, Mail, Lock, Camera } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const Profile = () => {
  const { authUser } = useAuthStore();

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

        {/* Profile Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary to-secondary p-1">
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
                <button className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </button>
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

              <div className="divider"></div>

              {/* Actions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security
                </h3>

                <button className="btn btn-outline btn-primary w-full">
                  <Lock className="w-4 h-4" />
                  Change Password
                </button>

                <button className="btn btn-outline w-full">Edit Profile</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
