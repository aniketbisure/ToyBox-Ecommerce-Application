import express from 'express';
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  verifyPayment,
  razorpayWebhook,
  reconcileOrder,
  cancelOrder
} from '../controllers/orderController';
import { protect, admin } from '../middleware/authMiddleware';
import { validateOrder } from '../middleware/validateMiddleware';

const router = express.Router();

router.post('/', protect, validateOrder, addOrderItems);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', razorpayWebhook);
router.get('/', protect, admin, getOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/reconcile', protect, admin, reconcileOrder);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

export default router;
