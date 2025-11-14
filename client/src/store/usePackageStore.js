import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { redirect } from "react-router-dom";

export const usePackageStore = create((set) => ({
  packages: [],
  bookings: [],
  isLoadingPackages: false,
  isBookingPackage: false,
  isSavingPackage: false,

  /**
   * Fetches packages from API and updates state.f
   */
  fetchPackages: async () => {
    set({ isLoadingPackages: true });
    try {
      const res = await axiosInstance.get("/packages");
      // Ensure backend gives { packages: [...] }
      const packages = Array.isArray(res.data?.packages)
        ? res.data.packages
        : Array.isArray(res.data)
        ? res.data
        : [];
      set({ packages });
    } catch {
      toast.error("Failed to fetch packages");
      set({ packages: [] });
    } finally {
      set({ isLoadingPackages: false });
    }
  },

  /**
   * Books a package and adds booking to state.
   * Redirects to "My Bookings" on success.
   */
  bookPackage: async ({
    packageId,
    eventDate,
    title,
    venue,
    suppliers = [],
  }) => {
    set({ isBookingPackage: true });
    try {
      const payload = {
        packageId,
        eventDate,
        title,
        venue,
        suppliers: Array.isArray(suppliers) ? suppliers : [],
      };
      const res = await axiosInstance.post("/bookings", payload);
      // Ensure backend returns booking object:
      const booking = res.data?.booking || res.data;
      set((state) => ({
        bookings: [...state.bookings, booking],
      }));
      toast.success("Package booked successfully");
      redirect("/my-bookings");
    } catch (error) {
      toast.error(error.response.data.message);
      throw error;
    } finally {
      set({ isBookingPackage: false });
    }
  },

  /**
   * Fetches current user's bookings.
   */
  fetchMyBookings: async () => {
    try {
      const res = await axiosInstance.get("/bookings");
      // Expect { bookings: [...] }
      const bookings = Array.isArray(res.data?.bookings)
        ? res.data.bookings
        : Array.isArray(res.data)
        ? res.data
        : [];
      set({ bookings });
    } catch {
      toast.error("Failed to fetch bookings");
      set({ bookings: [] });
    }
  },

  /**
   * Admin: Create a package
   */
  createPackage: async (formData) => {
    set({ isSavingPackage: true });
    try {
      const res = await axiosInstance.post("/packages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const created = res.data?.package || res.data;
      set((state) => ({
        packages: created ? [created, ...state.packages] : state.packages,
      }));
      toast.success("Package created");
      return created;
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "Create failed";
      toast.error(msg);
      throw error;
    } finally {
      set({ isSavingPackage: false });
    }
  },

  /**
   * Admin: Update a package
   */
  updatePackage: async (id, formData) => {
    set({ isSavingPackage: true });
    try {
      const res = await axiosInstance.put(`/packages/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = res.data?.package || res.data;
      set((state) => ({
        packages: state.packages.map((p) => (p._id === id ? updated : p)),
      }));
      toast.success("Package updated");
      return updated;
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "Update failed";
      toast.error(msg);
      throw error;
    } finally {
      set({ isSavingPackage: false });
    }
  },

  /**
   * Admin: Delete a package
   */
  deletePackage: async (id) => {
    try {
      await axiosInstance.delete(`/packages/${id}`);
      set((state) => ({
        packages: state.packages.filter((p) => p._id !== id),
      }));
      toast.success("Package deleted");
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "Delete failed";
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Admin: Toggle availability
   */
  toggleAvailability: async (id, next) => {
    try {
      const res = await axiosInstance.patch(`/packages/${id}/availability`, {
        isAvailable: next,
      });
      const updated = res.data?.package || res.data;
      set((state) => ({
        packages: state.packages.map((p) => (p._id === id ? updated : p)),
      }));
      toast.success(`Package ${next ? "enabled" : "disabled"}`);
      return updated;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to toggle availability";
      toast.error(msg);
      throw error;
    }
  },
}));
