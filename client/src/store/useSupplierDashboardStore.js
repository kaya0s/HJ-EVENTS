import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const normalizeUnavailableDates = (dates) =>
  Array.isArray(dates)
    ? dates
        .map((date) => {
          const formatted = dayjs(date).format("YYYY-MM-DD");
          return formatted === "Invalid Date" ? null : formatted;
        })
        .filter(Boolean)
    : [];

export const useSupplierDashboardStore = create((set, get) => ({
  profile: null,
  bookings: [],
  isLoadingProfile: false,
  isLoadingBookings: false,
  isUpdatingProfile: false,

  fetchSupplierProfile: async () => {
    const { profile, isLoadingProfile } = get();
    if (profile && !isLoadingProfile) return profile;

    set({ isLoadingProfile: true });
    try {
      const res = await axiosInstance.get("/suppliers/my-profile");
      const data = res.data || null;
      if (data) {
        data.unavailableDates = normalizeUnavailableDates(
          data.unavailableDates
        );
      }
      set({ profile: data, isLoadingProfile: false });
      return data;
    } catch (error) {
      console.error("Failed to fetch supplier profile:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load supplier profile"
      );
      set({ profile: null, isLoadingProfile: false });
      throw error;
    }
  },

  fetchSupplierBookings: async () => {
    set({ isLoadingBookings: true });
    try {
      const res = await axiosInstance.get("/suppliers/my-bookings");
      const bookings = Array.isArray(res.data) ? res.data : [];
      set({ bookings, isLoadingBookings: false });
      return bookings;
    } catch (error) {
      console.error("Failed to fetch supplier bookings:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load bookings data"
      );
      set({ bookings: [], isLoadingBookings: false });
      throw error;
    }
  },

  updateSupplierProfile: async (updates) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/suppliers/my-profile", updates);
      const updated = res.data?.supplier || res.data || null;
      if (updated) {
        updated.unavailableDates = normalizeUnavailableDates(
          updated.unavailableDates
        );
        set({ profile: updated });
      }
      toast.success("Profile updated successfully");
      return updated;
    } catch (error) {
      console.error("Failed to update supplier profile:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update supplier profile"
      );
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
