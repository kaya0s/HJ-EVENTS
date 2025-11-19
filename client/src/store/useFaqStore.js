import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export const useFaqStore = create((set) => ({
  faqs: [],
  isLoading: false,
  isSaving: false,

  fetchFaqs: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/faqs");
      const faqs = Array.isArray(res.data?.faqs) ? res.data.faqs : [];
      set({ faqs, isLoading: false });
      return faqs;
    } catch (error) {
      console.error("Failed to fetch FAQs", error);
      set({ isLoading: false });
      throw error;
    }
  },

  createFaq: async (payload) => {
    set({ isSaving: true });
    try {
      const res = await axiosInstance.post("/faqs", payload);
      const faq = res.data?.faq;
      if (faq) {
        set((state) => ({ faqs: [faq, ...state.faqs] }));
      }
      toast.success("FAQ created");
      return faq;
    } catch (error) {
      console.error("Failed to create FAQ", error);
      toast.error(error?.response?.data?.message || "Unable to create FAQ");
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  updateFaq: async (id, updates) => {
    set({ isSaving: true });
    try {
      const res = await axiosInstance.put(`/faqs/${id}`, updates);
      const updated = res.data?.faq;
      if (updated) {
        set((state) => ({
          faqs: state.faqs.map((faq) => (faq._id === id ? updated : faq)),
        }));
      }
      toast.success("FAQ updated");
      return updated;
    } catch (error) {
      console.error("Failed to update FAQ", error);
      toast.error(error?.response?.data?.message || "Unable to update FAQ");
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  deleteFaq: async (id) => {
    set({ isSaving: true });
    try {
      await axiosInstance.delete(`/faqs/${id}`);
      set((state) => ({
        faqs: state.faqs.filter((faq) => faq._id !== id),
      }));
      toast.success("FAQ removed");
    } catch (error) {
      console.error("Failed to delete FAQ", error);
      toast.error(error?.response?.data?.message || "Unable to delete FAQ");
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },
}));

export default useFaqStore;
