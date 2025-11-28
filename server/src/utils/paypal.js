import axios from 'axios';
import qs from 'qs';
import dotenv from 'dotenv';

dotenv.config();

const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase();

const API_BASE = PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

const getAuthHeader = async () => {
  // Fetch OAuth token
  const tokenEndpoint = `${API_BASE}/v1/oauth2/token`;
  const auth = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString('base64');
  try {
    const response = await axios.post(
      tokenEndpoint,
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const { access_token, token_type } = response.data;
    return { Authorization: `${token_type} ${access_token}` };
  } catch (error) {
    console.error('PayPal auth error:', error?.response?.data || error?.message);
    throw new Error('Failed to authenticate with PayPal');
  }
};

export const createOrder = async ({ amount, currency = 'PHP', description = '', reference_id = null }) => {
  const url = `${API_BASE}/v2/checkout/orders`;
  const headers = await getAuthHeader();
  try {
    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: String(Number(amount).toFixed(2)),
          },
          description,
          reference_id: reference_id || undefined,
          invoice_id: reference_id || undefined,
        },
      ],
      application_context: {
        brand_name: 'HJ Wedding Events',
        user_action: 'PAY_NOW',
      },
    };
    const response = await axios.post(url, body, { headers: { ...headers, 'Content-Type': 'application/json' } });
    return response.data;
  } catch (error) {
    console.error('PayPal create order error:', error?.response?.data || error?.message);
    throw error;
  }
};

export const captureOrder = async (orderId) => {
  const url = `${API_BASE}/v2/checkout/orders/${orderId}/capture`;
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
  const url = `${API_BASE}/v1/notifications/verify-webhook-signature`;
  const headers = await getAuthHeader();
  try {
    const body = {
      transmission_id,
      transmission_time,
      cert_url,
      auth_algo,
      transmission_sig,
      webhook_id: webhook_id || process.env.PAYPAL_WEBHOOK_ID,
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
