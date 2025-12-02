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

/**
 * @swagger
 * /messages/direct:
 *   post:
 *     tags: [Messages]
 *     summary: Send direct message to another user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post('/direct', authenticatedOnly, sendDirectMessageController)

/**
 * @swagger
 * /messages/group:
 *   post:
 *     tags: [Messages]
 *     summary: Send message to branch group chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post('/group', authenticatedOnly, sendGroupMessageController)

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Get list of conversations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 */
router.get('/conversations', authenticatedOnly, getConversationsController)

/**
 * @swagger
 * /messages/direct/{userId}:
 *   get:
 *     tags: [Messages]
 *     summary: Get direct chat history with a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 */
router.get('/direct/:userId', authenticatedOnly, getDirectChatHistoryController)

/**
 * @swagger
 * /messages/group:
 *   get:
 *     tags: [Messages]
 *     summary: Get branch group chat history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Group chat history retrieved successfully
 */
router.get('/group', authenticatedOnly, getGroupChatHistoryController)

/**
 * @swagger
 * /messages/direct/{userId}/read:
 *   put:
 *     tags: [Messages]
 *     summary: Mark direct messages as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.put('/direct/:userId/read', authenticatedOnly, markDirectMessagesAsReadController)

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 */
router.delete('/:id', authenticatedOnly, deleteMessageController)

/**
 * @swagger
 * /messages/unread-count:
 *   get:
 *     tags: [Messages]
 *     summary: Get unread message count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 */
router.get('/unread-count', authenticatedOnly, getUnreadCountController)

export default router
