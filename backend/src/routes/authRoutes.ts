import express from 'express';
import { register, login, refresh } from '../controllers/authController';
import { validateAuth } from '../middleware/validateMiddleware';

const router = express.Router();

router.post('/register', validateAuth, register);
router.post('/login', validateAuth, login);
router.post('/refresh', refresh);

export default router;
