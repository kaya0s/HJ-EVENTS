import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { redirect } from "react-router-dom";

export const usePackageStore = create((set) => ({
  packages: [],
  bookings: [],
  isLoadingPackages: false,
  isBookingPackage: false,

  /**
   * Fetches packages from API and updates state.
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
  bookPackage: async ({ packageName, eventDate, venue }) => {
    set({ isBookingPackage: true });
    try {
      const payload = { packageName, eventDate, venue };
      const res = await axiosInstance.post("/bookings", payload);
      // Ensure backend returns booking object:
      const booking = res.data?.booking || res.data;
      set((state) => ({
        bookings: [...state.bookings, booking],
      }));
      toast.success("Package booked successfully!");
      redirect("/my-bookings");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to book package");
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
}));
