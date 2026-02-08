import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import dayjs from "dayjs";

// Default supplier categories
const defaultCategories = [
  "Food",
  "catering",
  "Decoration",
  "Photography",
  "Videography",
  "Music",
  "Florist",
];

export const useSupplierStore = create((set) => ({
  suppliers: [],
  isLoading: false,
  categories: [],

  /**
   * Fetches all supplier categories
   */
  fetchSupplierCategories: async () => {
    try {
      const res = await axiosInstance.get("/suppliers/categories");
      const existingCategories = res.data.categories || [];
      const allCategories = [
        ...new Set([...defaultCategories, ...existingCategories]),
      ];
      set({ categories: allCategories });
    } catch (error) {
      console.error("Error fetching supplier categories:", error);
      set({ categories: defaultCategories });
    }
  },

  /**
   * Adds a new supplier category
   */
  addCategory: async (categoryName) => {
    try {
      // First, check if category already exists
      const state = useSupplierStore.getState();
      if (
        state.categories.some(
          (cat) => cat.toLowerCase() === categoryName.toLowerCase(),
        )
      ) {
        throw new Error("Category already exists");
      }

      // Call backend API to add the category
      const response = await axiosInstance.post("/suppliers/categories", {
        name: categoryName,
      });

      // Update local state
      const newCategories = [...state.categories, categoryName];
      set({ categories: newCategories });

      toast.success(response.data.message || "Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add category",
      );
      throw error;
    }
  },

  /**
   * Updates a supplier category
   */
  updateCategory: async (oldCategoryName, newCategoryName) => {
    try {
      // Check if old and new category names are the same
      if (oldCategoryName.toLowerCase() === newCategoryName.toLowerCase()) {
        throw new Error("Category name is the same");
      }

      // Check if new category name already exists
      const state = useSupplierStore.getState();
      if (
        state.categories.some(
          (cat) => cat.toLowerCase() === newCategoryName.toLowerCase(),
        )
      ) {
        throw new Error("Category already exists");
      }

      // Call backend API to update the category
      const response = await axiosInstance.put("/suppliers/categories", {
        oldName: oldCategoryName,
        newName: newCategoryName,
      });

      // Update local state
      const updatedCategories = state.categories.map((cat) =>
        cat.toLowerCase() === oldCategoryName.toLowerCase()
          ? newCategoryName
          : cat,
      );
      set({ categories: updatedCategories });

      toast.success(response.data.message || "Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update category",
      );
      throw error;
    }
  },

  /**
   * Deletes a supplier category
   */
  deleteCategory: async (categoryName) => {
    try {
      // Call backend API to delete the category
      const response = await axiosInstance.delete("/suppliers/categories", {
        data: { name: categoryName },
      });

      // Update local state
      const state = useSupplierStore.getState();
      const updatedCategories = state.categories.filter(
        (cat) => cat.toLowerCase() !== categoryName.toLowerCase(),
      );
      set({ categories: updatedCategories });

      toast.success(response.data.message || "Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete category",
      );
      throw error;
    }
  },

  /**
   * Fetches all suppliers
   */
  fetchAllSuppliers: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/suppliers");
      const rawSuppliers = Array.isArray(res.data?.suppliers)
        ? res.data.suppliers
        : Array.isArray(res.data)
          ? res.data
          : [];

      const suppliers = rawSuppliers.map((supplier) => ({
        ...supplier,
        unavailableDates: Array.isArray(supplier.unavailableDates)
          ? supplier.unavailableDates
              .map((date) => {
                const formatted = dayjs(date).format("YYYY-MM-DD");
                return formatted === "Invalid Date" ? null : formatted;
              })
              .filter(Boolean)
          : [],
      }));

      // Fetch categories from API
      const state = useSupplierStore.getState();
      await state.fetchSupplierCategories();

      set({ suppliers });
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
      Object.entries(supplierData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          if (value.length === 0) {
            formData.append(`${key}[]`, "");
          } else {
            value.forEach((item) => {
              if (item !== undefined && item !== null && item !== "") {
                formData.append(`${key}[]`, item);
              }
            });
          }
          return;
        }
        if (value !== "") {
          formData.append(key, value);
        }
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
      Object.entries(supplierData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          if (value.length === 0) {
            formData.append(`${key}[]`, "");
          } else {
            value.forEach((item) => {
              if (item !== undefined && item !== null && item !== "") {
                formData.append(`${key}[]`, item);
              }
            });
          }
          return;
        }
        if (value !== "") {
          formData.append(key, value);
        }
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
        },
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
