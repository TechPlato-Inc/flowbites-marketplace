import express from 'express';
import { TicketController } from './ticket.controller.js';
import { authenticate, can } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createTicketSchema,
  replyTicketSchema,
  listTicketsQuerySchema,
  assignTicketSchema,
} from './ticket.validator.js';

const router = express.Router();
const ticketController = new TicketController();

// User routes
router.post('/', authenticate, validate(createTicketSchema), ticketController.createTicket);
router.get('/my', authenticate, validate(listTicketsQuerySchema), ticketController.getMyTickets);
router.get('/:id', authenticate, ticketController.getTicket);
router.post('/:id/reply', authenticate, validate(replyTicketSchema), ticketController.addReply);
router.post('/:id/close', authenticate, ticketController.closeTicket);

// Admin routes
router.get('/admin/all', authenticate, can('tickets.admin'), validate(listTicketsQuerySchema), ticketController.getAllTickets);
router.get('/admin/stats', authenticate, can('tickets.admin'), ticketController.getTicketStats);
router.post('/admin/:id/assign', authenticate, can('tickets.admin'), validate(assignTicketSchema), ticketController.assignTicket);
router.post('/admin/:id/resolve', authenticate, can('tickets.admin'), ticketController.resolveTicket);

export default router;
