import { Router } from 'express'
import {
  sendDirectMessageController,
  sendGroupMessageController,
  getConversationsController,
  getDirectChatHistoryController,
  getGroupChatHistoryController,
  markDirectMessagesAsReadController,
  deleteMessageController,
  getUnreadCountController
} from '~/controllers/message.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { authenticatedOnly } from '~/middleware/role.middleware'

const router = Router()

router.use(authMiddleware)

// Send messages
router.post('/direct', authenticatedOnly, sendDirectMessageController)
router.post('/group', authenticatedOnly, sendGroupMessageController)

// Get conversations and chat history
router.get('/conversations', authenticatedOnly, getConversationsController)
router.get('/direct/:userId', authenticatedOnly, getDirectChatHistoryController)
router.get('/group', authenticatedOnly, getGroupChatHistoryController)

// Mark as read
router.put('/direct/:userId/read', authenticatedOnly, markDirectMessagesAsReadController)

// Delete message
router.delete('/:id', authenticatedOnly, deleteMessageController)

// Get unread count
router.get('/unread-count', authenticatedOnly, getUnreadCountController)

export default router
