import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../lib/axios.js';
import toast from 'react-hot-toast';

const PayPalButton = ({ booking, onSuccess, onError, onStart }) => {
  const [sdkReady, setSdkReady] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadSdk = async () => {
      if (window.paypal) {
        setSdkReady(true);
        return;
      }

      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
      const params = new URLSearchParams({
        'client-id': clientId,
        currency: 'PHP',
        intent: 'capture'
      });

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
      script.async = true;
      script.onload = () => setSdkReady(true);
      script.onerror = () => setSdkReady(false);
      document.body.appendChild(script);
    };

    loadSdk();
  }, []);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current) return;

    const buttons = window.paypal.Buttons({
      style: {
        layout: 'vertical', // KEEP ORIGINAL STYLE
        color: 'gold',
        shape: 'rect'
      },

      createOrder: async () => {
        try {
          onStart && onStart();
          const res = await axiosInstance.post(
            `/bookings/${booking._id}/paypal/create-order`
          );
          return res.data.orderId || res.data?.id;
        } catch (err) {
          toast.error(
            err?.response?.data?.message ||
              err.message ||
              'Failed to create PayPal order'
          );
          onError && onError(err);
          throw err;
        }
      },

      onApprove: async (data) => {
        try {
          const orderId = data.orderID || data.orderId;
          const res = await axiosInstance.post(
            `/bookings/${booking._id}/paypal/capture`,
            { orderId }
          );

          const updatedBooking = res.data.booking || res.data;
          toast.success('Payment completed successfully');
          onSuccess && onSuccess(updatedBooking, res.data);
        } catch (err) {
          toast.error(
            err?.response?.data?.message ||
              err.message ||
              'Failed to capture PayPal order'
          );
          onError && onError(err);
        }
      },

      onCancel: () => {
        toast('Payment cancelled');
        onError && onError(new Error('cancelled'));
      },

      onError: (err) => {
        toast.error('PayPal error: ' + (err?.message || 'Unknown error'));
        onError && onError(err);
      }
    });

    if (buttons.isEligible()) {
      buttons.render(containerRef.current);
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [sdkReady, booking]);

  return (
    <div
      ref={containerRef}
      className="bg-transparent"
      style={{ background: 'transparent' }}
    ></div>
  );
};

export default PayPalButton;
