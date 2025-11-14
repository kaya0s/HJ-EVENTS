import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-base-100 rounded-2xl shadow-lg p-8 flex flex-col justify-center mx-auto">
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-base-content/40" />
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
                className="btn btn-ghost btn-xs absolute right-2 top-2.5"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-base-content/40" />
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
                className="btn btn-ghost btn-xs absolute right-2 top-2.5"
                onClick={() => setShowConfirmPassword((p) => !p)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
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
  );
};

export default NewPassword;
