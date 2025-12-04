import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
    phone: "",
    address: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();
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
    if (!formData.firstName.trim())
      return toast.error("First name is required");
    if (!formData.lastName.trim()) return toast.error("Last name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.phone.trim()) return toast.error("Phone number is required");
    if (formData.phone.trim().length < 7)
      return toast.error("Enter a valid phone number");
    if (!formData.address.trim()) return toast.error("Address is required");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 8)
      return toast.error("Password must be at least 8 characters");

    // Strong password validation: capital letters, numbers, special characters
    const hasCapitalLetter = /[A-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
      formData.password
    );

    if (!hasCapitalLetter) {
      return toast.error("Password must contain at least one capital letter");
    }
    if (!hasNumber) {
      return toast.error("Password must contain at least one number");
    }
    if (!hasSpecialChar) {
      return toast.error(
        "Password must contain at least one special character"
      );
    }

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
        const result = await signup({ ...formData, recaptchaToken });
        if (result?.requiresVerification && result.email) {
          navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);
        } else {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Form submission error:", error);
        // Error message is already handled by the auth store
      }
    }
  };

  return (
    <section className="bg-gradient-to-b from-base-100/80 via-base-200/40 to-base-100/80">
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center w-full px-0 py-0 sm:px-4 sm:py-8 sm:container sm:mx-auto sm:max-w-screen-2xl">
        <div className="w-full bg-base-100 space-y-8 shadow-lg flex flex-col justify-center mx-auto rounded-none p-6 min-h-[calc(100vh-4rem)] sm:rounded-2xl sm:p-8 sm:max-w-md sm:min-h-0">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-4 group">
              {/* ADD YOUR LOGO HERE */}
              <Logo />

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
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-11"
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
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-11"
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
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-11"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Phone</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered w-full"
                  placeholder="+63 900 000 0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Address</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Street, City"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-11"
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
