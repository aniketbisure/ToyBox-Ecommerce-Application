import { Response } from 'express';
import Support from '../models/Support';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Create a new support ticket
// @route   POST /api/support
// @access  Private
export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const ticket = await Support.create({
      user: req.user!.id,
      subject,
      message,
      priority: priority || 'MEDIUM'
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error creating support ticket', error });
  }
};

// @desc    Get user's support tickets
// @route   GET /api/support/my-tickets
// @access  Private
export const getMyTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await Support.find({ user: req.user!.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching support tickets', error });
  }
};

// @desc    Get all support tickets (Admin)
// @route   GET /api/support
// @access  Private/Admin
export const getAllTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await Support.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching support tickets', error });
  }
};

// @desc    Update support ticket (Admin response/status)
// @route   PUT /api/support/:id
// @access  Private/Admin
export const updateTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { status, response, priority } = req.body;

    const ticket = await Support.findById(req.params.id);

    if (ticket) {
      ticket.status = status || ticket.status;
      ticket.response = response || ticket.response;
      ticket.priority = priority || ticket.priority;

      const updatedTicket = await ticket.save();
      res.json(updatedTicket);
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating support ticket', error });
  }
};
