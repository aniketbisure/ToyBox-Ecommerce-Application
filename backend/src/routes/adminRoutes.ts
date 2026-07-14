import express from 'express';
import {
  getMostViewedProducts,
  getMostSavedProducts
} from '../controllers/analyticsController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/analytics/most-viewed', protect, admin, getMostViewedProducts);
router.get('/analytics/most-saved', protect, admin, getMostSavedProducts);

export default router;
