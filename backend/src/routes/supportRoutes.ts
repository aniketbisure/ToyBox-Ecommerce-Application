import express from 'express';
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket
} from '../controllers/supportController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, admin, getAllTickets)
  .post(protect, createTicket);

router.get('/my-tickets', protect, getMyTickets);

router.route('/:id')
  .put(protect, admin, updateTicket);

export default router;
