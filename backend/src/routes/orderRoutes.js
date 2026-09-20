import express from 'express';
import { createOrder, getOrderById, unlockStream, getStreamToken, getVendorOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder);
router.route('/vendor').get(protect, getVendorOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').patch(protect, updateOrderStatus);
router.route('/:id/unlock-stream').post(protect, unlockStream);
router.route('/:id/stream-token').get(protect, getStreamToken);

export default router;
