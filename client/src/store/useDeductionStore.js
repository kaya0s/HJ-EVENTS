import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const normalizeKey = (value = "") => value.trim().toLowerCase();

const parseResponse = (payload) => {
  const entries = Array.isArray(payload?.deductions)
    ? payload.deductions
    : Array.isArray(payload)
    ? payload
    : [];

  const map = entries.reduce((acc, entry = {}) => {
    const key =
      entry.categoryKey ||
      normalizeKey(entry.category || entry.label || entry.key || "");
    if (!key) return acc;
    acc[key] = {
      amount: Number(entry.amount) || 0,
      label: entry.label || entry.category || entry.categoryKey || key,
    };
    return acc;
  }, {});

  return { entries, map };
};

export const useDeductionStore = create((set) => ({
  deductions: {},
  entries: [],
  isLoading: false,
  isSaving: false,

  fetchDeductions: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/deductions");
      const parsed = parseResponse(res.data);
      set({ deductions: parsed.map, entries: parsed.entries });
      return parsed.map;
    } catch (error) {
      console.error("Failed to fetch deductions", error);
      toast.error(
        error?.response?.data?.message || "Failed to load deduction settings"
      );
      set({ deductions: {}, entries: [] });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  saveDeductions: async (updates = []) => {
    set({ isSaving: true });
    try {
      const res = await axiosInstance.put("/deductions", {
        deductions: updates,
      });
      const parsed = parseResponse(res.data);
      set({ deductions: parsed.map, entries: parsed.entries });
      toast.success("Deduction settings saved");
      return parsed.map;
    } catch (error) {
      console.error("Failed to save deductions", error);
      toast.error(
        error?.response?.data?.message || "Failed to save deduction settings"
      );
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  getDeductionForCategory: (category) => {
    const key = normalizeKey(category || "");
    const state = useDeductionStore.getState();
    return state.deductions[key]?.amount || 0;
  },
}));

export const normalizeDeductionKey = normalizeKey;
