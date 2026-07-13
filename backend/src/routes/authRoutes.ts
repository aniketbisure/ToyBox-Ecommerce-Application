import express from 'express';
import { register, login, refresh, verifyToken } from '../controllers/authController';
import { validateAuth } from '../middleware/validateMiddleware';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', validateAuth, register);
router.post('/login', validateAuth, login);
router.post('/refresh', refresh);
router.get('/verify', protect, verifyToken);

export default router;
