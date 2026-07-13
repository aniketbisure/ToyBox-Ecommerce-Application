import express from 'express';
import { getProfile, updateProfile, getUsers, deleteProfile } from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteProfile);
router.get('/admin/all', protect, admin, getUsers);

export default router;
