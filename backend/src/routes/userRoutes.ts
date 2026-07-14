import express from 'express';
import {
  getProfile,
  updateProfile,
  getUsers,
  deleteProfile,
  updateWishlist,
  updateCart,
  updateSavedItems,
  updateRecentlyViewed
} from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteProfile);
router.put('/wishlist', protect, updateWishlist);
router.put('/cart', protect, updateCart);
router.put('/saved', protect, updateSavedItems);
router.put('/history', protect, updateRecentlyViewed);
router.get('/admin/all', protect, admin, getUsers);

export default router;
