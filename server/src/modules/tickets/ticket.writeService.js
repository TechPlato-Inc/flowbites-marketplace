import { Ticket } from './ticket.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { NotificationService } from '../notifications/notification.service.js';
import { sendTicketReply } from '../../services/email.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

const notificationService = new NotificationService();

export class TicketWriteService {
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

    eventBus.emit(EVENTS.TICKET_CREATED, {
      ticketId: ticket._id,
      userId,
      subject,
      category,
    });

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

    eventBus.emit(EVENTS.TICKET_RESOLVED, {
      ticketId: ticket._id,
      userId: ticket.userId,
      resolvedBy: userId,
    });

    return ticket;
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

    eventBus.emit(EVENTS.TICKET_RESOLVED, {
      ticketId: ticket._id,
      userId: ticket.userId,
      resolvedBy: adminId,
    });

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
}
