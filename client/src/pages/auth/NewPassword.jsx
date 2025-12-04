import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Loader2, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../../components/Logo";
const NewPassword = () => {
  const { setNewPassword } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if resetToken and code exist, if not redirect to forgot password
    const resetToken = sessionStorage.getItem("resetToken");
    const resetCode = sessionStorage.getItem("resetCode");
    if (!resetToken || !resetCode) {
      toast.error("Please complete the reset code verification first");
      navigate("/forgot-password");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password.trim()) {
      return toast.error("Please enter a new password");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setSubmitting(true);
    try {
      await setNewPassword(formData.password, formData.confirmPassword);
      navigate("/login");
    } catch {
      // Error is already handled in the store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-base-100/80 via-base-200/40 to-base-100/80">
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center w-full px-0 py-0 sm:px-4 sm:py-8 sm:container sm:mx-auto sm:max-w-screen-2xl">
        <div className="w-full bg-base-100 space-y-8 shadow-lg flex flex-col justify-center mx-auto rounded-none p-6 min-h-[calc(100vh-4rem)] sm:rounded-2xl sm:p-8 sm:max-w-md sm:min-h-0">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Logo />
              </div>
              <h1 className="text-2xl font-bold mt-2">Set New Password</h1>
              <p className="text-base-content/60">Enter your new password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">New Password</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary/80 z-10"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Confirm New Password
                </span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary/80 z-10"
                  onClick={() => setShowConfirmPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Update Password</>
              )}
            </button>
          </form>

          <div className="text-sm text-center">
            <Link to="/login" className="link">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewPassword;
