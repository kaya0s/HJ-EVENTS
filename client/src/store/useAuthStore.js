import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { redirect } from "react-router-dom";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket && get().connectSocket();
    } catch (error) {
      toast.error(
        "account creation failed: " + error.response?.data?.message ||
          error.message
      );
    } finally {
      set({ isSigningUp: false });
    }
  },

  forgotPassword: async (data) => {
    try {
      await axiosInstance.post("/auth/forgot-password", data);
      toast.success("Email sent successfully");
      redirect("/verify-reset-code");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  loginWithGoogle: async () => {
    set({ isLoggingIn: true });
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const googleAuthUrl = `${apiUrl}/auth/google`;

      // Open the Google sign-in popup, handled by your backend
      const popup = window.open(
        googleAuthUrl,
        "googleSignIn",
        "width=500,height=600"
      );

      if (!popup) {
        throw new Error(
          "Popup was blocked. Please allow pop-ups for this site."
        );
      }

      // Listen for OAuth response from backend
      const result = await new Promise((resolve, reject) => {
        function receiveMessage(event) {
          // Check the message is from the same origin
          if (event.origin !== window.location.origin) {
            return;
          }
          if (event.data && event.data.type === "google-auth-success") {
            window.removeEventListener("message", receiveMessage);
            resolve(event.data.user);
            if (popup && !popup.closed) {
              popup.close();
            }
          } else if (event.data && event.data.type === "google-auth-error") {
            window.removeEventListener("message", receiveMessage);
            reject(new Error(event.data.message));
            if (popup && !popup.closed) {
              popup.close();
            }
          }
        }

        window.addEventListener("message", receiveMessage);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener("message", receiveMessage);
            reject(new Error("Google login was cancelled."));
          }
        }, 1000);

        // Failsafe timeout
        setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener("message", receiveMessage);
          if (popup && !popup.closed) {
            popup.close();
          }
          reject(new Error("Google login timed out."));
        }, 3 * 60 * 1000);
      });

      set({ authUser: result });
      toast.success("Logged in with Google successfully");
    } catch (error) {
      toast.error(error.message || "Google login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  sendResetLink: async (email) => {
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      toast.success("Email sent successfully");
      redirect("/verify-reset-code");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  verifyResetCode: async (payload) => {
    try {
      await axiosInstance.post("/auth/verify-reset-code", payload);
      toast.success("Code verified. You can set a new password.");
      redirect("/new-password");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  setNewPassword: async (payload) => {
    try {
      await axiosInstance.post("/auth/new-password", payload);
      toast.success("Password updated. Please login.");
      redirect("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
