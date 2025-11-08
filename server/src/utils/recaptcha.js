import axios from 'axios';

/**
 * Verify reCAPTCHA token with Google's API
 * @param {string} recaptchaToken - The reCAPTCHA token from the client
 * @returns {Promise<boolean>} - Returns true if verification is successful
 */
export const verifyRecaptcha = async (recaptchaToken) => {
  if (!recaptchaToken) {
    return false;
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY is not set. Skipping reCAPTCHA verification.');
    return process.env.NODE_ENV === 'development';
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      new URLSearchParams({
        secret: secretKey,
        response: recaptchaToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { success, score } = response.data;

    if (score !== undefined) {
      // Score threshold: 0.5 is recommended, but you can adjust based on your needs
      const scoreThreshold = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD || '0.5');
      return success === true && score >= scoreThreshold;
    }

    // This is reCAPTCHA v2 - only check success
    return success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};
