import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import Logo from "../../components/Logo";
import { useAuthStore } from "../../store/useAuthStore";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    pendingVerificationEmail,
    verifyEmail,
    resendVerificationCode,
    isVerifyingEmail,
    isResendingVerification,
  } = useAuthStore();

  const initialEmail = useMemo(
    () => searchParams.get("email") || pendingVerificationEmail || "",
    [searchParams, pendingVerificationEmail]
  );

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!email && pendingVerificationEmail) {
      setEmail(pendingVerificationEmail);
    }
  }, [email, pendingVerificationEmail]);

  useEffect(() => {
    if (!email && !pendingVerificationEmail) {
      toast.error("We couldn’t find an email to verify. Please sign up again.");
      navigate("/signup", { replace: true });
    }
  }, [email, pendingVerificationEmail, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !code.trim()) {
      toast.error("Enter the verification code from your email.");
      return;
    }

    try {
      await verifyEmail(email, code.trim());
      navigate("/", { replace: true });
    } catch {
      // errors are handled in the store
    }
  };

  const handleResend = async () => {
    try {
      await resendVerificationCode(email);
    } catch {
      // toast handled in store
    }
  };

  return (
    <section className="bg-gradient-to-b from-base-100/80 via-base-200/40 to-base-100/80 min-h-[calc(100vh-4rem)] flex items-center justify-center w-full px-0 py-0 sm:px-4 sm:py-10 sm:container sm:mx-auto sm:max-w-screen-2xl">
      <div className="w-full bg-base-100 space-y-8 shadow-lg rounded-none p-6 min-h-[calc(100vh-4rem)] sm:rounded-2xl sm:p-8 sm:max-w-md sm:min-h-0">
        <div className="text-center space-y-3">
          <div className="mx-auto size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MailCheck className="size-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-sm text-base-content/70">
            We sent a 6-digit code to{" "}
            <span className="font-medium">{email}</span>. Enter it below to
            activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Verification code</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="input input-bordered w-full tracking-widest text-center text-lg"
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isVerifyingEmail}
          >
            {isVerifyingEmail ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify email"
            )}
          </button>
        </form>

        <div className="flex flex-col gap-3 text-sm text-base-content/70">
          <button
            type="button"
            className="btn btn-ghost btn-sm justify-start"
            onClick={handleResend}
            disabled={isResendingVerification}
          >
            {isResendingVerification ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending code...
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                Resend code
              </>
            )}
          </button>
          <p className="text-center text-xs text-base-content/60">
            Entered the wrong email?{" "}
            <Link to="/signup" className="link link-primary text-xs">
              Go back to sign up
            </Link>
          </p>
        </div>

        {/* Bottom logo/contact block removed */}
        <div className="text-center text-xs text-base-content/50">
          Need help? Contact{" "}
          <a
            className="link link-hover"
            href={`mailto:${
              import.meta.env.VITE_SUPPORT_EMAIL || "hello@hjweddings.com"
            }`}
          >
            support
          </a>
          .
        </div>
      </div>
    </section>
  );
};

export default VerifyEmailPage;
