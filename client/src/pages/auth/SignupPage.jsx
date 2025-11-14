import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import { loadRecaptchaScript, executeRecaptcha } from "../../utils/recaptcha";
import Logo from "../../components/Logo";
import toast from "react-hot-toast";

// Get reCAPTCHA site key from environment variable
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  // Load reCAPTCHA script on mount if site key is configured
  useEffect(() => {
    if (RECAPTCHA_SITE_KEY) {
      loadRecaptchaScript(RECAPTCHA_SITE_KEY).catch((error) => {
        console.error("Failed to load reCAPTCHA:", error);
      });
    }
  }, []);

  const validateForm = () => {
    if (!formData.firstName.trim())
      return toast.error("First name is required");
    if (!formData.lastName.trim()) return toast.error("Last name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();

    if (success === true) {
      try {
        let recaptchaToken = "";

        // Execute reCAPTCHA v3 if site key is configured
        if (RECAPTCHA_SITE_KEY) {
          try {
            recaptchaToken = await executeRecaptcha(
              RECAPTCHA_SITE_KEY,
              "signup"
            );
          } catch (error) {
            console.error("reCAPTCHA execution error:", error);
            toast.error("reCAPTCHA verification failed. Please try again.");
            return;
          }
        }

        // Send form data with reCAPTCHA token to backend
        signup({ ...formData, recaptchaToken });
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <section className="bg-gradient-to-b from-base-100/80 via-base-200/40 to-base-100/80">
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8 bg-base-100 rounded-2xl shadow-lg p-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center
              group-hover:bg-primary/20 transition-colors"
              >
                <Logo />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Start planning your special day!
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-2">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text font-medium">First Name</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text font-medium">Last Name</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default SignUpPage;
