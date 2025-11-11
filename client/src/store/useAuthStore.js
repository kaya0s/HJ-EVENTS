import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";

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
      console.log("Error in checking auth:", error);
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

  sendResetCode: async (email) => {
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      // Store resetToken from response for use in next steps
      if (res.data.resetToken) {
        sessionStorage.setItem("resetToken", res.data.resetToken);
      }
      toast.success("Reset code sent to your email");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      throw error;
    }
  },

  verifyResetCode: async (code) => {
    try {
      const resetToken = sessionStorage.getItem("resetToken");
      if (!resetToken) {
        toast.error("Reset token not found. Please request a new reset code.");
        throw new Error("Reset token not found");
      }
      await axiosInstance.post("/auth/verify-reset-code", { resetToken, code });
      // Store code for next step
      sessionStorage.setItem("resetCode", code);
      toast.success("Code verified. You can set a new password.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      throw error;
    }
  },

  setNewPassword: async (newPassword, confirmNewPassword) => {
    try {
      const resetToken = sessionStorage.getItem("resetToken");
      const code = sessionStorage.getItem("resetCode");
      if (!resetToken || !code) {
        toast.error("Reset token or code not found. Please start over.");
        throw new Error("Reset token or code not found");
      }
      await axiosInstance.post("/auth/new-password", {
        resetToken,
        code,
        newPassword,
        confirmNewPassword,
      });
      // Clear stored reset data
      sessionStorage.removeItem("resetToken");
      sessionStorage.removeItem("resetCode");
      toast.success("Password updated. Please login.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      throw error;
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

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
      return res.data.user;
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || error.message);
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isUpdatingProfile: true });
    try {
      await axiosInstance.put("/users/me/password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
