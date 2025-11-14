/**
 * Load reCAPTCHA v3 script
 * @param {string} siteKey - reCAPTCHA site key
 * @returns {Promise<void>}
 */
export const loadRecaptchaScript = (siteKey) => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.grecaptcha && window.grecaptcha.ready) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      'script[src*="recaptcha/api.js"]'
    );
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
      return;
    }

    // Create and load script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA script"));
    document.head.appendChild(script);
  });
};

/**
 * Execute reCAPTCHA v3 and get token
 * @param {string} siteKey - reCAPTCHA site key
 * @param {string} action - Action name (e.g., 'login', 'signup')
 * @returns {Promise<string>} - reCAPTCHA token
 */
export const executeRecaptcha = async (siteKey, action = "submit") => {
  try {
    // Ensure script is loaded
    await loadRecaptchaScript(siteKey);

    // Wait for grecaptcha to be ready
    await new Promise((resolve) => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(resolve);
      } else {
        resolve();
      }
    });

    // Execute reCAPTCHA
    const token = await window.grecaptcha.execute(siteKey, { action });
    return token;
  } catch (error) {
    console.error("reCAPTCHA execution error:", error);
    throw error;
  }
};
