import { TicketQueryService } from './ticket.queryService.js';
import { TicketWriteService } from './ticket.writeService.js';
import { rbacService } from '../rbac/rbac.service.js';
import { toTicketDTO, toTicketDetailDTO } from './dto/ticket.dto.js';

const ticketQueryService = new TicketQueryService();
const ticketWriteService = new TicketWriteService();

export class TicketController {
  async createTicket(req, res, next) {
    try {
      const ticket = await ticketWriteService.createTicket(req.user._id, req.body);
      res.status(201).json({ success: true, data: toTicketDTO(ticket) });
    } catch (error) {
      next(error);
    }
  }

  async getMyTickets(req, res, next) {
    try {
      const result = await ticketQueryService.getMyTickets(req.user._id, req.query);
      res.json({
        success: true,
        data: {
          tickets: result.tickets.map(toTicketDTO),
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTicket(req, res, next) {
    try {
      const isAdmin = rbacService.hasPermission(req.user.permissions, 'tickets.admin');
      const ticket = await ticketQueryService.getTicket(req.params.id, req.user._id, isAdmin);
      res.json({ success: true, data: toTicketDetailDTO(ticket) });
    } catch (error) {
      next(error);
    }
  }

  async addReply(req, res, next) {
    try {
      const isAdmin = rbacService.hasPermission(req.user.permissions, 'tickets.admin');
      const ticket = await ticketWriteService.addReply(req.params.id, req.user._id, req.body, isAdmin);
      res.json({ success: true, data: toTicketDTO(ticket) });
    } catch (error) {
      next(error);
    }
  }

  async closeTicket(req, res, next) {
    try {
      const isAdmin = rbacService.hasPermission(req.user.permissions, 'tickets.admin');
      const ticket = await ticketWriteService.closeTicket(req.params.id, req.user._id, isAdmin);
      res.json({ success: true, data: toTicketDTO(ticket) });
    } catch (error) {
      next(error);
    }
  }

  // Admin routes
  async getAllTickets(req, res, next) {
    try {
      const result = await ticketQueryService.getAllTickets(req.query);
      res.json({
        success: true,
        data: {
          tickets: result.tickets.map(toTicketDTO),
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async assignTicket(req, res, next) {
    try {
      const ticket = await ticketWriteService.assignTicket(req.params.id, req.user._id, req.body.assignToId);
      res.json({ success: true, data: toTicketDTO(ticket) });
    } catch (error) {
      next(error);
    }
  }

  async resolveTicket(req, res, next) {
    try {
      const ticket = await ticketWriteService.resolveTicket(req.params.id, req.user._id);
      res.json({ success: true, data: toTicketDTO(ticket) });
    } catch (error) {
      next(error);
    }
  }

  async getTicketStats(req, res, next) {
    try {
      const data = await ticketQueryService.getTicketStats();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
