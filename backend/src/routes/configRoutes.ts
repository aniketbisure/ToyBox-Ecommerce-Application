import express from 'express';
import {
  getConfig,
  updateConfig,
  addCategory,
  deleteCategory,
  addBanner,
  deleteBanner
} from '../controllers/configController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getConfig);
router.put('/', protect, admin, updateConfig);
router.post('/categories', protect, admin, addCategory);
router.delete('/categories/:name', protect, admin, deleteCategory);
router.post('/banners', protect, admin, addBanner);
router.delete('/banners/:id', protect, admin, deleteBanner);

export default router;
