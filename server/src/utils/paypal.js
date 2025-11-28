import axios from 'axios';
import dotenv from 'dotenv';
import qs from 'qs';

// Ensure .env loaded. The server may already load dotenv, but this ensures the utils also have values in other runtimes
dotenv.config();

const PAYPAL_MODE = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase().trim();
const PAYPAL_CLIENT_ID = (process.env.PAYPAL_CLIENT_ID || '').trim();
const PAYPAL_CLIENT_SECRET = (process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET || '').trim();
export const PAYPAL_BASE = PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.error('[PayPal] PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required in server env');
}
if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET && PAYPAL_CLIENT_ID === PAYPAL_CLIENT_SECRET) {
  console.warn('[PayPal] Client ID and Secret appear to be identical — please verify you used the correct sandbox credentials');
}

/**
 * Returns Bearer token header
 */
export async function getAuthHeader() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('Missing PayPal credentials: set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET');
  }

  const tokenUrl = `${PAYPAL_BASE}/v1/oauth2/token`;
  try {
    // Use axios with auth to create Basic Authorization header automatically
    const tokenRes = await axios.post(
      tokenUrl,
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_CLIENT_SECRET,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      }
    );
    const body = tokenRes.data;
    if (!body || !body.access_token) {
      console.error('[PayPal] token response missing access_token', body);
      throw new Error('Failed to authenticate with PayPal: no access token returned');
    }
    // Return headers object to allow caller to merge easily
    return { Authorization: `Bearer ${body.access_token}` };
  } catch (err) {
    // If we get a HTTP 401 with PayPal, include masked credential and mode for debugging
    const maskedClient = PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.slice(0, 6)}...${PAYPAL_CLIENT_ID.slice(-6)}` : 'not-set';
    console.error(`[PayPal] token request failed: ${err?.response?.status || ''} ${err?.response?.statusText || err?.message || ''}`);
    if (err?.response?.data) {
      console.error('[PayPal] token response body:', err.response.data);
    }
    console.error(`[PayPal] base=${PAYPAL_BASE} mode=${PAYPAL_MODE} client=${maskedClient}`);
    throw new Error('Failed to authenticate with PayPal: invalid credentials or network issue (see server logs)');
  }
}

// Example helper: create order
export async function createOrder({ amount, currency = 'PHP', description = '', reference_id }) {
  const headers = await getAuthHeader();
  const url = `${PAYPAL_BASE}/v2/checkout/orders`;

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: String(reference_id || ''),
        description,
        amount: {
          currency_code: currency,
          value: String(Number(amount || 0).toFixed(2)),
        },
        invoice_id: reference_id ? String(reference_id) : undefined,
      },
    ].map((pu) => {
      // remove undefined fields
      Object.keys(pu).forEach((k) => pu[k] === undefined && delete pu[k]);
      return pu;
    }),
  };

  try {
    const response = await axios.post(url, payload, { headers: { ...headers, 'Content-Type': 'application/json' }, timeout: 10000 });
    return response.data;
  } catch (err) {
    console.error('[PayPal] create order failed', err?.response?.status || '', err?.response?.statusText || '', err?.response?.data || err?.message || err);
    throw new Error('Failed to create PayPal order');
  }
}

export const captureOrder = async (orderId) => {
  const url = `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`;
  const headers = await getAuthHeader();
  try {
    const response = await axios.post(url, {}, { headers: { ...headers, 'Content-Type': 'application/json' } });
    return response.data;
  } catch (error) {
    console.error('PayPal capture order error:', error?.response?.data || error?.message);
    throw error;
  }
};

export const verifyWebhookSignature = async ({ transmission_id, transmission_time, cert_url, auth_algo, transmission_sig, webhook_id, webhook_event }) => {
  // Following PayPal API: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
  const url = `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`;
  const headers = await getAuthHeader();
  try {
    const body = {
      transmission_id,
      transmission_time,
      cert_url,
      auth_algo,
      transmission_sig,
      // Accept either correct env key or the mis-typed key present in some .env files
      webhook_id: webhook_id || process.env.PAYPAL_WEBHOOK_ID || process.env.PAYPAL_WEEBHOOK_ID,
      webhook_event,
    };
    const response = await axios.post(url, body, { headers: { ...headers, 'Content-Type': 'application/json' } });
    return response.data && response.data.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('PayPal verify webhook error:', error?.response?.data || error?.message);
    return false;
  }
};

export default {
  createOrder,
  captureOrder,
  verifyWebhookSignature,
};
