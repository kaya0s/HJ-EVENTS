import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Camera,
  ShoppingBag,
  UtensilsCrossed,
  Music,
  Palette,
  Film,
} from "lucide-react";
import { useSupplierStore } from "../../store/useSupplierStore";
import {
  normalizeDeductionKey,
  useDeductionStore,
} from "../../store/useDeductionStore";

// Map normalized category key to a relevant Lucide icon
// Categories from supplier.model.js (enum): ['Food', 'catering', 'Decoration', 'Photography', 'Videography', 'Music', 'Florist']
const categoryIcons = {
  food: UtensilsCrossed,
  catering: UtensilsCrossed,
  decoration: Palette,
  photography: Camera,
  videography: Film,
  music: Music,
  florist: Palette,
};

function getCategoryIcon(normalizedKey) {
  const Icon = categoryIcons[normalizedKey] || ShoppingBag;
  return <Icon className="h-5 w-5 text-primary" />;
}

const ExternalSupplierSettings = () => {
  const {
    categories,
    fetchAllSuppliers,
    isLoading: isLoadingSuppliers,
  } = useSupplierStore();
  const {
    deductions,
    fetchDeductions,
    saveDeductions,
    isLoading: isLoadingDeductions,
    isSaving,
  } = useDeductionStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState("");
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([fetchAllSuppliers(), fetchDeductions()]);
      } finally {
        setIsInitialized(true);
      }
    };
    bootstrap();
  }, [fetchAllSuppliers, fetchDeductions]);

  // Merge all unique categories from suppliers and existing deductions
  const allCategories = useMemo(() => {
    const seen = new Set();
    const rows = [];
    const addCategory = (label = "") => {
      const normalized = normalizeDeductionKey(label);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      rows.push({
        key: normalized,
        label,
      });
    };

    (categories || []).forEach((category) => addCategory(category));
    Object.values(deductions || {}).forEach((entry) => {
      addCategory(entry?.label);
    });

    return rows.sort((a, b) => a.label.localeCompare(b.label));
  }, [categories, deductions]);

  // When deduction/modal opens, set the modal value to existing deduction or 0
  const openEditModal = (category) => {
    setModalError("");
    setSelectedCategory(category);
    const key = category.key;
    const ded = deductions?.[key];
    setModalValue(
      ded?.amount && !isNaN(ded.amount) ? ded.amount.toString() : "0"
    );
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
    setModalError("");
  };

  const handleModalValueChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and not negative
    if (/^\d{0,7}$/.test(value)) {
      setModalValue(value);
      setModalError("");
    }
  };

  // Save deduction for just the selected category
  const handleSaveDeduction = async () => {
    if (!selectedCategory) return;
    const amountNum = Number(modalValue);
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      setModalError("Enter a valid deduction amount.");
      return;
    }
    const payload = [
      {
        category: selectedCategory.label,
        label: selectedCategory.label,
        amount: amountNum,
      },
    ];
    await saveDeductions(payload);
    closeEditModal();
  };

  const isLoading = !isInitialized || isLoadingSuppliers || isLoadingDeductions;

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body space-y-6">
        <div>
          <h3 className="card-title">External Supplier Price Deduction</h3>
          <p className="text-sm text-base-content/70">
            Select a category to set the price deduction for when clients bring
            their own supplier.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-base-content/70 mt-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading categories...
          </div>
        ) : allCategories.length === 0 ? (
          <p className="text-sm text-base-content/70 mt-6">
            No supplier categories found yet. Create supplier records first to
            configure deductions.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {allCategories.map((cat) => {
              const key = cat.key;
              const ded = deductions?.[key];
              const amount = typeof ded?.amount === "number" ? ded.amount : 0;
              const Icon = categoryIcons[key] || ShoppingBag;
              return (
                <button
                  key={key}
                  className="btn btn-ghost flex flex-col items-center justify-center h-24 border border-base-300 hover:border-primary transition"
                  onClick={() => openEditModal(cat)}
                  title={`Set deduction for ${cat.label}`}
                  type="button"
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="text-xs mt-2 capitalize">{cat.label}</span>
                  <span className="text-sm font-semibold">
                    ₱{amount.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Deduction Edit Modal */}
        {modalOpen && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-sm mx-auto p-6 relative animate-fade-in">
              <button
                aria-label="Close"
                className="btn btn-sm btn-circle absolute right-2 top-2"
                onClick={closeEditModal}
                disabled={isSaving}
              >
                ✕
              </button>
              <h4 className="font-semibold text-lg mb-1 flex items-center gap-2">
                {getCategoryIcon(selectedCategory.key)}
                Set deduction for {selectedCategory.label}
              </h4>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">
                    Deduction amount{" "}
                    <span className="ml-1 text-base-content/60">(₱)</span>
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered"
                  value={modalValue}
                  onChange={handleModalValueChange}
                  disabled={isSaving}
                />
                {modalError && (
                  <span className="text-error text-xs mt-1">{modalError}</span>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeEditModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveDeduction}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalSupplierSettings;
