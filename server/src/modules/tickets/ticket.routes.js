import express from 'express';
import { TicketController } from './ticket.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createTicketSchema, ticketReplySchema, assignTicketSchema } from './ticket.validator.js';

const router = express.Router();
const ticketController = new TicketController();

// User routes
router.post('/', authenticate, validate(createTicketSchema), ticketController.createTicket);
router.get('/my', authenticate, ticketController.getMyTickets);
router.get('/:id', authenticate, ticketController.getTicket);
router.post('/:id/reply', authenticate, validate(ticketReplySchema), ticketController.addReply);
router.post('/:id/close', authenticate, ticketController.closeTicket);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), ticketController.getAllTickets);
router.get('/admin/stats', authenticate, authorize('admin'), ticketController.getTicketStats);
router.post('/admin/:id/assign', authenticate, authorize('admin'), validate(assignTicketSchema), ticketController.assignTicket);
router.post('/admin/:id/resolve', authenticate, authorize('admin'), ticketController.resolveTicket);

export default router;
