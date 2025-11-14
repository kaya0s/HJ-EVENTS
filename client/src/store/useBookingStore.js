import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";

export const useBookingStore = create((set) => ({
  bookings: [],
  isLoading: false,
  statistics: {
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  },

  /**
   * Fetches all bookings for admin
   */
  fetchAllBookings: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/bookings/all");
      console.log("Bookings API Response:", res.data);

      let bookings = [];
      if (Array.isArray(res.data?.bookings)) {
        bookings = res.data.bookings;
      } else if (Array.isArray(res.data)) {
        bookings = res.data;
      } else if (res.data && typeof res.data === "object") {
        // Some APIs send { success: true, bookings: [...] }, or { data: [...] }
        if (Array.isArray(res.data.data)) {
          bookings = res.data.data;
        } else if (Array.isArray(res.data.results)) {
          bookings = res.data.results;
        } else {
          // fallback to empty
          bookings = [];
        }
      }
      // Defensive: bookings should be an array; otherwise fallback to empty.
      if (!Array.isArray(bookings)) {
        console.warn("Bookings is not an array:", bookings);
        bookings = [];
      }

      console.log(`Parsed ${bookings.length} bookings from response`);

      // Calculate statistics
      const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "Pending").length,
        accepted: bookings.filter((b) => b.status === "Accepted").length,
        completed: bookings.filter((b) => b.status === "Completed").length,
        cancelled: bookings.filter((b) => b.status === "Cancelled").length,
        rejected: bookings.filter((b) => b.status === "Rejected").length,
      };

      set({ bookings, statistics: stats });
    } catch (error) {
      // Explain the error through toast for debugging
      let msg = "Failed to fetch bookings";
      if (error?.response?.data?.message) {
        msg += ": " + error.response.data.message;
      } else if (error?.message) {
        msg += ": " + error.message;
      }
      console.error("Error fetching bookings:", error);
      console.error("Error response:", error?.response?.data);
      toast.error(msg);
      set({
        bookings: [],
        statistics: {
          total: 0,
          pending: 0,
          accepted: 0,
          completed: 0,
          cancelled: 0,
          rejected: 0,
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Accepts a booking
   */
  acceptBooking: async (bookingId) => {
    try {
      await axiosInstance.post(`/bookings/approve/${bookingId}`);
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? { ...b, status: "Accepted" } : b
        ),
      }));
      toast.success("Booking accepted");
      // Refresh statistics
      const state = useBookingStore.getState();
      await state.fetchAllBookings();
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to accept booking";
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Rejects a booking
   */
  rejectBooking: async (bookingId) => {
    try {
      await axiosInstance.post(`/bookings/reject/${bookingId}`);
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? { ...b, status: "Rejected" } : b
        ),
      }));
      toast.success("Booking rejected");
      // Refresh statistics
      const state = useBookingStore.getState();
      await state.fetchAllBookings();
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject booking";
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Assigns suppliers to a booking
   */
  assignSuppliers: async (bookingId, supplierIds) => {
    try {
      const res = await axiosInstance.patch(
        `/bookings/${bookingId}/suppliers`,
        {
          suppliers: supplierIds,
        }
      );
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? res.data.booking : b
        ),
      }));
      toast.success("Suppliers assigned successfully");
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to assign suppliers";
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Fetches user's own bookings
   */
  fetchMyBookings: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/bookings/me");
      // Defensive parsing identical to fetchAllBookings
      // console.log("Bookings GET /bookings/me:", res.data)
      let bookings = [];
      if (Array.isArray(res.data?.bookings)) {
        bookings = res.data.bookings;
      } else if (Array.isArray(res.data)) {
        bookings = res.data;
      } else if (res.data && typeof res.data === "object") {
        if (Array.isArray(res.data.data)) {
          bookings = res.data.data;
        } else if (Array.isArray(res.data.results)) {
          bookings = res.data.results;
        } else {
          bookings = [];
        }
      }
      if (!Array.isArray(bookings)) bookings = [];
      return bookings;
    } catch (error) {
      let msg = "Failed to fetch bookings";
      if (error?.response?.data?.message) {
        msg += ": " + error.response.data.message;
      } else if (error?.message) {
        msg += ": " + error.message;
      }
      console.error("Error fetching my bookings:", error);
      toast.error(msg);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  /**
   * Cancels a booking (client initiated)
   */
  cancelMyBooking: async (bookingId) => {
    try {
      const res = await axiosInstance.post(`/bookings/cancel/${bookingId}`);
      toast.success("Booking cancelled");
      return res.data?.booking;
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to cancel booking";
      toast.error(msg);
      throw error;
    }
  },
}));
