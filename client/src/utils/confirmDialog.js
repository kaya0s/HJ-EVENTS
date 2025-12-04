import Swal from "sweetalert2";

/**
 * Get current DaisyUI theme colors using HSL values
 * This function properly reads DaisyUI theme variables
 */
const getThemeColors = () => {
  const html = document.documentElement;

  // Helper to get HSL color from CSS variable
  const getHSLColor = (varName) => {
    const value = getComputedStyle(html)
      .getPropertyValue(`--${varName}`)
      .trim();
    return value ? `hsl(${value})` : null;
  };

  return {
    background: getHSLColor("b1") || getHSLColor("base-100") || "#ffffff",
    text: getHSLColor("bc") || getHSLColor("base-content") || "#000000",
    primary: getHSLColor("p") || getHSLColor("primary") || "#3b82f6",
    success: getHSLColor("su") || getHSLColor("success") || "#10b981",
    error: getHSLColor("er") || getHSLColor("error") || "#ef4444",
    warning: getHSLColor("wa") || getHSLColor("warning") || "#f59e0b",
    border: getHSLColor("b2") || getHSLColor("base-200") || "#e5e7eb",
  };
};

/**
 * Show a confirmation dialog styled with DaisyUI theme
 * @param {Object} options - Configuration options
 * @param {string} options.title - Dialog title
 * @param {string} options.text - Dialog message
 * @param {string} options.confirmText - Confirm button text (default: "Confirm")
 * @param {string} options.cancelText - Cancel button text (default: "Cancel")
 * @param {string} options.confirmButtonClass - DaisyUI button class for confirm (default: "btn-success")
 * @param {string} options.cancelButtonClass - DaisyUI button class for cancel (default: "btn-outline")
 * @param {string} options.icon - SweetAlert2 icon type (default: "question")
 * @param {boolean} options.showCancelButton - Show cancel button (default: true)
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export const confirmDialog = async ({
  title = "Confirm Action",
  text = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "btn-success",
  cancelButtonClass = "btn-outline",
  icon = "question",
  showCancelButton = true,
  html = null,
}) => {
  const colors = getThemeColors();

  // Wrap content in full-width DaisyUI card
  const cardContent = html
    ? `<div class="card bg-base-100 shadow-xl border border-base-300 w-full">
         <div class="card-body p-4 px-0">
           ${html}
         </div>
       </div>`
    : `<div class="card bg-base-100 shadow-xl border border-base-300 w-full">
         <div class="card-body p-4 px-0">
           <p class="text-base">${text}</p>
         </div>
       </div>`;

  const result = await Swal.fire({
    title,
    html: cardContent,
    icon,
    showCancelButton,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    background: colors.background,
    color: colors.text,
    customClass: {
      popup:
        "!bg-base-100 !text-base-content rounded-box shadow-xl border border-base-300",
      title: "!text-base-content font-bold text-lg mb-3",
      htmlContainer: "!m-0 w-full !mb-4",
      confirmButton: `btn btn-sm ${confirmButtonClass}`,
      cancelButton: `btn btn-sm ${cancelButtonClass}`,
      actions: "!w-full flex justify-end gap-2 !mt-0",
    },
    buttonsStyling: false,
    reverseButtons: true,
    width: "500px",
    padding: "1.25rem",
  });

  return result.isConfirmed;
};

/**
 * Show an alert dialog styled with DaisyUI theme
 * @param {Object} options - Configuration options
 * @param {string} options.title - Alert title
 * @param {string} options.text - Alert message
 * @param {string} options.icon - SweetAlert2 icon type (default: "info")
 * @param {string} options.buttonText - Button text (default: "OK")
 * @returns {Promise<void>}
 */
export const alertDialog = async ({
  title = "Alert",
  text = "",
  icon = "info",
  buttonText = "OK",
  buttonClass = "btn-primary",
}) => {
  const colors = getThemeColors();

  // Wrap content in full-width DaisyUI card
  const cardContent = `<div class="card bg-base-100 shadow-xl border border-base-300 w-full">
                         <div class="card-body p-4">
                           <p class="text-base">${text}</p>
                         </div>
                       </div>`;

  await Swal.fire({
    title,
    html: cardContent,
    icon,
    confirmButtonText: buttonText,
    background: colors.background,
    color: colors.text,
    customClass: {
      popup:
        "!bg-base-100 !text-base-content rounded-box shadow-xl border border-base-300",
      title: "!text-base-content font-bold text-lg mb-3",
      htmlContainer: "!m-0 w-full !mb-4",
      confirmButton: `btn btn-sm ${buttonClass}`,
      actions: "!w-full flex justify-center !mt-0",
    },
    buttonsStyling: false,
    width: "500px",
    padding: "1.25rem",
  });
};

/**
 * Show a success toast notification
 * @param {string} message - Success message
 * @param {number} timer - Auto-close timer in ms (default: 3000)
 */
export const showSuccessToast = (message, timer = 3000) => {
  const colors = getThemeColors();

  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    background: colors.success,
    color: "#ffffff",
    customClass: {
      popup:
        "!bg-success !text-success-content rounded-box shadow-lg border border-success",
      title: "!text-success-content font-semibold",
    },
    didOpen: (toast) => {
      toast.style.marginTop = "1rem";
      toast.style.marginRight = "1rem";
    },
  });
};

/**
 * Show an error toast notification
 * @param {string} message - Error message
 * @param {number} timer - Auto-close timer in ms (default: 4000)
 */
export const showErrorToast = (message, timer = 4000) => {
  const colors = getThemeColors();

  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    background: colors.error,
    color: "#ffffff",
    customClass: {
      popup:
        "!bg-error !text-error-content rounded-box shadow-lg border border-error",
      title: "!text-error-content font-semibold",
    },
    didOpen: (toast) => {
      toast.style.marginTop = "1rem";
      toast.style.marginRight = "1rem";
    },
  });
};

/**
 * Show a warning toast notification
 * @param {string} message - Warning message
 * @param {number} timer - Auto-close timer in ms (default: 3500)
 */
export const showWarningToast = (message, timer = 3500) => {
  const colors = getThemeColors();

  Swal.fire({
    icon: "warning",
    title: "Warning",
    text: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    background: colors.warning,
    color: "#000000",
    customClass: {
      popup:
        "!bg-warning !text-warning-content rounded-box shadow-lg border border-warning",
      title: "!text-warning-content font-semibold",
    },
    didOpen: (toast) => {
      toast.style.marginTop = "1rem";
      toast.style.marginRight = "1rem";
    },
  });
};

/**
 * Show an info toast notification
 * @param {string} message - Info message
 * @param {number} timer - Auto-close timer in ms (default: 3000)
 */
export const showInfoToast = (message, timer = 3000) => {
  const colors = getThemeColors();

  Swal.fire({
    icon: "info",
    title: "Info",
    text: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    background: colors.primary,
    color: "#ffffff",
    customClass: {
      popup:
        "!bg-info !text-info-content rounded-box shadow-lg border border-info",
      title: "!text-info-content font-semibold",
    },
    didOpen: (toast) => {
      toast.style.marginTop = "1rem";
      toast.style.marginRight = "1rem";
    },
  });
};
