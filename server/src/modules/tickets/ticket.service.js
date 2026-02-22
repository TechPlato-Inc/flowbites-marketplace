import { Ticket } from './ticket.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { NotificationService } from '../notifications/notification.service.js';
import { sendTicketReply } from '../../services/email.js';

const notificationService = new NotificationService();

export class TicketService {
  /**
   * Create a support ticket.
   */
  async createTicket(userId, { subject, category, message, priority }) {
    const ticket = await Ticket.create({
      userId,
      subject,
      category,
      priority: priority || 'medium',
      messages: [{
        senderId: userId,
        message,
        isStaffReply: false,
      }],
    });

    return ticket;
  }

  /**
   * Get user's own tickets.
   */
  async getMyTickets(userId, { page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit;
    const query = { userId };
    if (status) query.status = status;

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .select('-messages')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(query),
    ]);

    return {
      tickets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a specific ticket (user or admin).
   */
  async getTicket(ticketId, userId, isAdmin = false) {
    const ticket = await Ticket.findById(ticketId)
      .populate('userId', 'name email avatar')
      .populate('messages.senderId', 'name avatar')
      .populate('assignedTo', 'name')
      .lean();

    if (!ticket) throw new AppError('Ticket not found', 404);

    if (!isAdmin && ticket.userId._id.toString() !== userId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    return ticket;
  }

  /**
   * Add a reply to a ticket.
   */
  async addReply(ticketId, userId, { message }, isAdmin = false) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new AppError('Ticket not found', 404);

    if (!isAdmin && ticket.userId.toString() !== userId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    if (ticket.status === 'closed') {
      throw new AppError('Cannot reply to a closed ticket', 400);
    }

    ticket.messages.push({
      senderId: userId,
      message,
      isStaffReply: isAdmin,
    });

    // Update status based on who replied
    if (isAdmin && ticket.status === 'open') {
      ticket.status = 'in_progress';
    } else if (isAdmin) {
      ticket.status = 'waiting_on_user';
    } else if (ticket.status === 'waiting_on_user') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    // Notify the other party about the reply (non-blocking)
    if (isAdmin) {
      // Admin replied → notify user
      User.findById(userId).then(admin => {
        const staffName = admin?.name || 'Support';
        notificationService.notifyTicketReply(ticket.userId, ticketId, ticket.subject, staffName).catch(() => {});
        User.findById(ticket.userId).then(user => {
          if (user) sendTicketReply(user.email, user.name, staffName, ticket.subject).catch(() => {});
        }).catch(() => {});
      }).catch(() => {});
    }

    return ticket;
  }

  /**
   * Get all tickets (admin).
   */
  async getAllTickets({ page = 1, limit = 20, status, category, priority, assignedTo } = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('userId', 'name email avatar')
        .populate('assignedTo', 'name')
        .select('-messages')
        .sort({ priority: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(query),
    ]);

    return {
      tickets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Assign a ticket to an admin.
   */
  async assignTicket(ticketId, adminId, assignToId) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new AppError('Ticket not found', 404);

    ticket.assignedTo = assignToId;
    if (ticket.status === 'open') ticket.status = 'in_progress';
    await ticket.save();

    return ticket;
  }

  /**
   * Resolve a ticket (admin).
   */
  async resolveTicket(ticketId, adminId) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new AppError('Ticket not found', 404);

    ticket.status = 'resolved';
    ticket.resolvedBy = adminId;
    ticket.resolvedAt = new Date();
    await ticket.save();

    AuditLog.create({
      adminId,
      action: 'ticket_resolved',
      targetType: 'ticket',
      targetId: ticketId,
      details: { subject: ticket.subject, category: ticket.category },
    }).catch(() => {});

    // Notify user (non-blocking)
    notificationService.notifyTicketResolved(ticket.userId, ticketId, ticket.subject).catch(() => {});

    return ticket;
  }

  /**
   * Close a ticket (user or admin).
   */
  async closeTicket(ticketId, userId, isAdmin = false) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new AppError('Ticket not found', 404);

    if (!isAdmin && ticket.userId.toString() !== userId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();

    return ticket;
  }

  /**
   * Get ticket stats (admin).
   */
  async getTicketStats() {
    const [total, byStatus, byCategory] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $match: { status: { $nin: ['resolved', 'closed'] } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const statuses = {};
    byStatus.forEach(s => { statuses[s._id] = s.count; });

    const categories = {};
    byCategory.forEach(c => { categories[c._id] = c.count; });

    return {
      total,
      open: (statuses.open || 0) + (statuses.in_progress || 0) + (statuses.waiting_on_user || 0),
      byStatus: statuses,
      byCategory: categories,
    };
  }
}
