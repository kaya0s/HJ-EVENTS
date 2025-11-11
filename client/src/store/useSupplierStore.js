import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";

export const useSupplierStore = create((set) => ({
  suppliers: [],
  isLoading: false,
  categories: [],

  /**
   * Fetches all suppliers
   */
  fetchAllSuppliers: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/suppliers");
      const suppliers = Array.isArray(res.data?.suppliers)
        ? res.data.suppliers
        : Array.isArray(res.data)
        ? res.data
        : [];

      // Extract unique categories
      const categories = [...new Set(suppliers.map((s) => s.category))].filter(
        Boolean
      );

      set({ suppliers, categories });
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to fetch suppliers");
      set({ suppliers: [], categories: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Creates a new supplier
   */
  createSupplier: async (supplierData, imageFile) => {
    try {
      const formData = new FormData();
      Object.keys(supplierData).forEach((key) => {
        formData.append(key, supplierData[key]);
      });
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await axiosInstance.post("/suppliers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Supplier created successfully");
      const state = useSupplierStore.getState();
      await state.fetchAllSuppliers();
      return res.data.supplier;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create supplier");
      throw error;
    }
  },

  /**
   * Updates an existing supplier
   */
  updateSupplier: async (supplierId, supplierData, imageFile) => {
    try {
      const formData = new FormData();
      Object.keys(supplierData).forEach((key) => {
        formData.append(key, supplierData[key]);
      });
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await axiosInstance.put(
        `/suppliers/${supplierId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Supplier updated successfully");
      const state = useSupplierStore.getState();
      await state.fetchAllSuppliers();
      return res.data.supplier;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update supplier");
      throw error;
    }
  },

  /**
   * Deletes a supplier
   */
  deleteSupplier: async (supplierId) => {
    try {
      await axiosInstance.delete(`/suppliers/${supplierId}`);
      toast.success("Supplier deleted successfully");
      const state = useSupplierStore.getState();
      await state.fetchAllSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete supplier");
      throw error;
    }
  },

  /**
   * Gets suppliers by category
   */
  getSuppliersByCategory: (category) => {
    const state = useSupplierStore.getState();
    if (!category) return state.suppliers;
    return state.suppliers.filter((s) => s.category === category);
  },
}));
