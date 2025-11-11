import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import AuthImagePattern from "../../components/AuthImagePattern";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Check, Loader2, Heart } from "lucide-react";
import toast from "react-hot-toast";

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
    } catch (error) {
      // Error is already handled in the store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Heart className="w-6 h-6 text-primary" />
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-base-content/40" />
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

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Verify your reset code"}
        subtitle={
          "Enter the 6-digit code sent to your email to continue resetting your password."
        }
      />
    </div>
  );
};

export default VerifyResetCode;
