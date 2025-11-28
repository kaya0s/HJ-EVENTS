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
      const params = new URLSearchParams({ 'client-id': clientId, currency: 'PHP', intent: 'capture' });
      const src = `https://www.paypal.com/sdk/js?${params.toString()}`;
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => setSdkReady(true);
      script.onerror = () => setSdkReady(false);
      document.body.appendChild(script);
    };
    loadSdk();
  }, []);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current) return;
    // render buttons
    const button = window.paypal.Buttons({
      style: { layout: 'vertical' },
      createOrder: async function () {
        try {
          onStart && onStart();
          const res = await axiosInstance.post(`/bookings/${booking._id}/paypal/create-order`);
          const orderId = res.data.orderId || res.data?.id;
          return orderId;
        } catch (err) {
          const msg = err?.response?.data?.message || err.message || 'Failed to create PayPal order';
          toast.error(msg);
          onError && onError(err);
          throw err;
        }
      },
      onApprove: async function (data) {
        try {
          const orderId = data.orderID || data.orderId;
          const res = await axiosInstance.post(`/bookings/${booking._id}/paypal/capture`, { orderId });
          const updatedBooking = res.data.booking || res.data;
          toast.success('Payment completed successfully');
          onSuccess && onSuccess(updatedBooking, res.data);
        } catch (err) {
          const msg = err?.response?.data?.message || err.message || 'Failed to capture PayPal order';
          toast.error(msg);
          onError && onError(err);
        }
      },
      onCancel: function (data) {
        toast('Payment cancelled');
        onError && onError(new Error('cancelled'));
      },
      onError: function (err) {
        toast.error('PayPal error: ' + (err?.message || 'Unknown error'));
        onError && onError(err);
      },
    });

    if (button.isEligible()) {
      button.render(containerRef.current);
    }

    return () => {
      // Clean up rendered button if PayPal provides cleanup
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [sdkReady, booking]);

  return <div ref={containerRef} />;
};

export default PayPalButton;
