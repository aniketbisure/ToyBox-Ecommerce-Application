import express from 'express';
import { getProfile, getUsers } from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/admin/all', protect, admin, getUsers);

export default router;
