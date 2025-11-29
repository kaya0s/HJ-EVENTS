import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../../components/Logo";

const VerifyResetCode = () => {
  const { verifyResetCode } = useAuthStore();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if resetToken exists, if not redirect to forgot password
    const resetToken = sessionStorage.getItem("resetToken");
    if (!resetToken) {
      toast.error("Please request a reset code first");
      navigate("/forgot-password");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      return toast.error("Please enter the reset code");
    }
    setSubmitting(true);
    try {
      await verifyResetCode(code);
      navigate("/new-password");
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
              <h1 className="text-2xl font-bold mt-2">Verify Reset Code</h1>
              <p className="text-base-content/60">
                Enter the code sent to your email
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Reset Code</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10">
                  <KeyRound className="h-5 w-5" />
                </div>

                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>

            <button className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Verify Code
                </>
              )}
            </button>
          </form>

          <div className="text-sm text-center">
            <Link to="/forgot-password" className="link">
              Resend code
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyResetCode;
