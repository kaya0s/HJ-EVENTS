import express from 'express';
import { handlePaypalWebhook } from '../controllers/booking.controller.js';

const router = express.Router();

// PayPal webhook endpoint
router.post('/paypal', express.json({ type: '*/*' }), handlePaypalWebhook);

export default router;
