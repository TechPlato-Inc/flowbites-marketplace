import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 5000
  },
  isStaffReply: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['billing', 'technical', 'account', 'template', 'refund', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_on_user', 'resolved', 'closed'],
    default: 'open'
  },
  messages: [ticketMessageSchema],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  closedAt: Date,
}, {
  timestamps: true
});

ticketSchema.index({ userId: 1, createdAt: -1 });
ticketSchema.index({ status: 1, priority: -1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ userId: 1, status: 1, updatedAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1, updatedAt: -1 });

export const Ticket = mongoose.model('Ticket', ticketSchema);
