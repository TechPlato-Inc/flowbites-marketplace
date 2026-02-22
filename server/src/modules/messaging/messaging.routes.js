import express from 'express';
import { MessagingController } from './messaging.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { upload } from '../../middleware/upload.js';
import {
  createConversationSchema,
  sendMessageSchema,
  searchUsersSchema,
  paginationSchema,
} from './messaging.validator.js';

const router = express.Router();
const messagingController = new MessagingController();

// All routes require authentication
router.use(authenticate);

// Static routes MUST come before :id wildcard
router.get('/unread-count', messagingController.getUnreadCount);
router.get('/search-users', validate(searchUsersSchema), messagingController.searchUsers);

// List & create conversations
router.get('/', validate(paginationSchema), messagingController.getConversations);
router.post('/', validate(createConversationSchema), messagingController.createConversation);

// Parameterized routes
router.get('/:id', validate(paginationSchema), messagingController.getConversation);
router.post('/:id/messages', upload.array('attachments', 5), validate(sendMessageSchema), messagingController.sendMessage);
router.patch('/:id/read', messagingController.markAsRead);
router.delete('/:id', messagingController.deleteConversation);

export default router;
