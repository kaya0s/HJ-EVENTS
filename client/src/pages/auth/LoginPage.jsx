import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, User2, LockKeyhole } from "lucide-react";
import Logo from "../../components/Logo";
import toast from "react-hot-toast";
import GoogleButton from "react-google-button";
import { loadRecaptchaScript, executeRecaptcha } from "../../utils/recaptcha";

// Get reCAPTCHA site key from environment variable
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  // Load reCAPTCHA script on mount if site key is configured
  useEffect(() => {
    if (RECAPTCHA_SITE_KEY) {
      loadRecaptchaScript(RECAPTCHA_SITE_KEY).catch((error) => {
        console.error("Failed to load reCAPTCHA:", error);
      });
    }
  }, []);

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    if (isValid === true) {
      try {
        let recaptchaToken = "";

        // Execute reCAPTCHA v3 if site key is configured
        if (RECAPTCHA_SITE_KEY) {
          try {
            recaptchaToken = await executeRecaptcha(
              RECAPTCHA_SITE_KEY,
              "login"
            );
          } catch (error) {
            console.error("reCAPTCHA execution error:", error);
            toast.error("reCAPTCHA verification failed. Please try again.");
            return;
          }
        }

        // Send form data with reCAPTCHA token to backend
        const loggedInUser = await login({ ...formData, recaptchaToken });

        if (loggedInUser?.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (loggedInUser?.role === "supplier") {
          navigate("/supplier", { replace: true });
        } else if (loggedInUser) {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      toast.error("Google login failed.");
    }
  };

  return (
    <section className="bg-gradient-to-b from-base-100/80 via-base-200/40 to-base-100/80">
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center w-full px-0 py-0 sm:px-4 sm:py-8 sm:container sm:mx-auto sm:max-w-screen-2xl lg:flex-row lg:items-center">
        <div className="w-full bg-base-100 shadow-lg space-y-8 flex flex-col justify-center mx-auto rounded-none p-6 min-h-[calc(100vh-4rem)] sm:rounded-2xl sm:p-8 sm:max-w-md sm:min-h-0">
          {/* Logo */}
          <div className="text-center mb-4">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20
            transition-colors"
              >
                <Logo />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">
                Sign in to plan your wedding day
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10">
                  <User2 className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-11"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-11"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  autoComplete="current-password"
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
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-base-content/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-base-100 px-2 text-base-content/40">or</span>
            </div>
          </div>

          {/* Google Auth */}
          <div className="w-full">
            <GoogleButton
              style={{ width: "100%" }}
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              label="Sign in with Google"
            />
          </div>

          <div className="text-center space-y-2">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </p>
            <p className="text-base-content/60">
              <Link to="/forgot-password" className="link link-primary">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default LoginPage;
