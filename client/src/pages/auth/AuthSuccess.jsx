import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader } from "lucide-react";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get("token");
      const userParam = searchParams.get("user");

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));

          // Post message to parent window (for popup flow)
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "google-auth-success",
                user: user,
                token: token,
              },
              window.location.origin
            );
            // Wait a bit before closing to ensure message is received
            setTimeout(() => {
              window.close();
            }, 100);
          } else {
            // If not in popup, refresh auth and redirect to home
            await checkAuth();
            navigate("/", { replace: true });
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "google-auth-error",
                message: "Failed to parse user data",
              },
              window.location.origin
            );
            window.close();
          } else {
            navigate("/login?error=oauth_failed", { replace: true });
          }
        }
      } else {
        // Missing parameters
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "google-auth-error",
              message: "Missing authentication parameters",
            },
            window.location.origin
          );
          window.close();
        } else {
          navigate("/login?error=oauth_failed", { replace: true });
        }
      }
    };

    handleAuth();
  }, [searchParams, navigate, checkAuth]);

  return (
    <section className="bg-gradient-to-b from-base-100/80 via-base-200/40 to-base-100/80">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="size-10 animate-spin mx-auto mb-4" />
          <p className="text-base-content/70">Completing authentication...</p>
        </div>
      </div>
    </section>
  );
};

export default AuthSuccess;
