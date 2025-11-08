import { useAuthStore } from "../../store/useAuthStore";

const Profile = () => {
  const { authUser } = useAuthStore();

  return (
    <section className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-base-100 border border-base-300 rounded-2xl p-8 shadow-md flex flex-col items-center">
        <div className="mb-6">
          {/* Profile picture */}
          <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center text-4xl font-bold text-primary">
            {/* simple fallback, initial */}
            {authUser?.fullName ? authUser.fullName[0].toUpperCase() : " "}
          </div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <div>
            <label className="text-sm text-base-content/60 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={authUser?.fullName || ""}
              readOnly
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="text-sm text-base-content/60 block mb-1">
              Email
            </label>
            <input
              type="email"
              value={authUser?.email || ""}
              readOnly
              className="input input-bordered w-full"
            />
          </div>
        </div>
        <div className="w-full mt-8">
          <button type="button" className="btn btn-primary w-full">
            Change Password
          </button>
        </div>
      </div>
    </section>
  );
};

export default Profile;
