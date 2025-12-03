import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";

export const useBookingStore = create((set) => ({
  bookings: [],
  isLoading: false,
  lastFilters: {},
  statistics: {
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    expired: 0,
  },

  /**
   * Fetches all bookings for admin
   */
  fetchAllBookings: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      const query = params.toString();
      const res = await axiosInstance.get(
        `/bookings/all${query ? `?${query}` : ""}`
      );

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

      // Calculate statistics
      const stats = {
        total: bookings.length,
        pending: bookings.filter(
          (b) => b.status === "pending" || b.status === "Pending"
        ).length,
        accepted: bookings.filter(
          (b) => b.status === "accepted" || b.status === "Accepted"
        ).length,
        completed: bookings.filter(
          (b) => b.status === "completed" || b.status === "Completed"
        ).length,
        cancelled: bookings.filter(
          (b) => b.status === "cancelled" || b.status === "Cancelled"
        ).length,
        rejected: bookings.filter(
          (b) => b.status === "rejected" || b.status === "Rejected"
        ).length,
        expired: bookings.filter(
          (b) => b.status === "expired" || b.status === "Expired"
        ).length,
      };

      set({ bookings, statistics: stats, lastFilters: filters });
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
          expired: 0,
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
      const state = useBookingStore.getState();
      const booking = state.bookings.find((b) => b._id === bookingId);
      await axiosInstance.post(`/bookings/approve/${bookingId}`, {
        lastKnownUpdatedAt: booking?.updatedAt,
      });
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? { ...b, status: "accepted" } : b
        ),
      }));
      toast.success("Booking accepted");
      // Refresh statistics
      await useBookingStore.getState().fetchAllBookings();
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to accept booking";
      if (error?.response?.status === 409) {
        msg =
          error?.response?.data?.message ||
          "Someone else updated this booking. Please refresh.";
      }
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Rejects a booking
   */
  rejectBooking: async (bookingId) => {
    try {
      const state = useBookingStore.getState();
      const booking = state.bookings.find((b) => b._id === bookingId);
      await axiosInstance.post(`/bookings/reject/${bookingId}`, {
        lastKnownUpdatedAt: booking?.updatedAt,
      });
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? { ...b, status: "rejected" } : b
        ),
      }));
      toast.success("Booking rejected");
      // Refresh statistics
      await useBookingStore.getState().fetchAllBookings();
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject booking";
      if (error?.response?.status === 409) {
        msg =
          error?.response?.data?.message ||
          "Someone else updated this booking. Please refresh.";
      }
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Marks a booking as completed
   */
  completeBooking: async (bookingId) => {
    try {
      const state = useBookingStore.getState();
      const booking = state.bookings.find((b) => b._id === bookingId);
      await axiosInstance.post(`/bookings/complete/${bookingId}`, {
        lastKnownUpdatedAt: booking?.updatedAt,
      });
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? { ...b, status: "completed" } : b
        ),
      }));
      toast.success("Booking marked as completed");
      await useBookingStore.getState().fetchAllBookings();
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to complete booking";
      if (error?.response?.status === 409) {
        msg =
          error?.response?.data?.message ||
          "Someone else updated this booking. Please refresh.";
      }
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Assigns suppliers to a booking
   */
  assignSuppliers: async (bookingId, supplierIds) => {
    try {
      const state = useBookingStore.getState();
      const booking = state.bookings.find((b) => b._id === bookingId);
      const res = await axiosInstance.patch(
        `/bookings/${bookingId}/suppliers`,
        {
          suppliers: supplierIds,
          lastKnownUpdatedAt: booking?.updatedAt,
        }
      );
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? res.data.booking : b
        ),
      }));
      toast.success("Suppliers assigned successfully");
      return { booking: res.data.booking, conflict: false };
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to assign suppliers";
      if (error?.response?.status === 409) {
        msg =
          error?.response?.data?.message ||
          "Someone else updated this booking. Please refresh.";
        // Update local store with the fresh booking returned by server to keep UI consistent
        const fresh = error?.response?.data?.booking;
        if (fresh) {
          set((state) => ({
            bookings: state.bookings.map((b) =>
              b._id === fresh._id ? fresh : b
            ),
          }));
          return { booking: fresh, conflict: true };
        }
      }
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
      const state = useBookingStore.getState();
      const booking = state.bookings.find((b) => b._id === bookingId);
      const res = await axiosInstance.post(`/bookings/cancel/${bookingId}`, {
        lastKnownUpdatedAt: booking?.updatedAt,
      });
      toast.success("Booking cancelled");
      return res.data?.booking;
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to cancel booking";
      if (error?.response?.status === 409) {
        msg =
          error?.response?.data?.message ||
          "Someone else updated this booking. Please refresh.";
      }
      toast.error(msg);
      throw error;
    }
  },

  /**
   * Updates a booking (client initiated)
   */
  updateMyBooking: async (bookingId, data) => {
    try {
      const state = useBookingStore.getState();
      const b = state.bookings.find((x) => x._id === bookingId);
      const payload = {
        ...data,
        lastKnownUpdatedAt: data?.lastKnownUpdatedAt || b?.updatedAt,
      };
      const res = await axiosInstance.patch(`/bookings/${bookingId}`, payload);
      toast.success("Booking updated successfully");
      return res.data?.booking;
    } catch (error) {
      if (error?.response?.status === 409) {
        toast.error(
          error?.response?.data?.message ||
            "Someone else updated this booking. Please refresh."
        );
      } else {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update booking";
        toast.error(msg);
      }
      throw error;
    }
  },
  /**
   * Create a PayPal order (backend)
   */
  createPayPalOrder: async (bookingId) => {
    try {
      const state = useBookingStore.getState();
      const booking = state.bookings.find((b) => b._id === bookingId);
      const res = await axiosInstance.post(
        `/bookings/${bookingId}/paypal/create-order`,
        { lastKnownUpdatedAt: booking?.updatedAt }
      );
      return res.data?.orderId || (res.data?.id && res.data.id) || null;
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create PayPal order";
      if (error?.response?.status === 409) {
        msg =
          error?.response?.data?.message ||
          "Someone else updated this booking. Please refresh.";
      }
      toast.error(msg);
      throw error;
    }
  },
  /**
   * Capture a PayPal order on the backend and update booking
   */
  capturePayPalOrder: async (bookingId, orderId) => {
    try {
      const state = useBookingStore.getState();
      const booking = state.bookings.find((b) => b._id === bookingId);
      const res = await axiosInstance.post(
        `/bookings/${bookingId}/paypal/capture`,
        { orderId, lastKnownUpdatedAt: booking?.updatedAt }
      );
      // update booking in store
      const updatedBooking = res.data?.booking || res.data;
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b._id === bookingId ? updatedBooking : b
        ),
      }));
      toast.success("Payment successful");
      return res.data;
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to capture PayPal order";
      if (error?.response?.status === 409) {
        msg =
          error?.response?.data?.message ||
          "Someone else updated this booking. Please refresh.";
      }
      toast.error(msg);
      throw error;
    }
  },
}));
