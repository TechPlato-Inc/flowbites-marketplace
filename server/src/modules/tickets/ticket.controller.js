import { TicketService } from './ticket.service.js';

const ticketService = new TicketService();

export class TicketController {
  async createTicket(req, res, next) {
    try {
      const data = await ticketService.createTicket(req.user._id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getMyTickets(req, res, next) {
    try {
      const data = await ticketService.getMyTickets(req.user._id, req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTicket(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
      const data = await ticketService.getTicket(req.params.id, req.user._id, isAdmin);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async addReply(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
      const data = await ticketService.addReply(req.params.id, req.user._id, req.body, isAdmin);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async closeTicket(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
      const data = await ticketService.closeTicket(req.params.id, req.user._id, isAdmin);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // Admin routes
  async getAllTickets(req, res, next) {
    try {
      const data = await ticketService.getAllTickets(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async assignTicket(req, res, next) {
    try {
      const data = await ticketService.assignTicket(req.params.id, req.user._id, req.body.assignToId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async resolveTicket(req, res, next) {
    try {
      const data = await ticketService.resolveTicket(req.params.id, req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTicketStats(req, res, next) {
    try {
      const data = await ticketService.getTicketStats();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
