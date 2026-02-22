import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
  relatedTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    default: null,
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
}, {
  timestamps: true,
});

conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
