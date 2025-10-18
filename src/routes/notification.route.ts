import { Router } from 'express'
import {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotificationController,
  deleteAllReadNotificationsController
} from '~/controllers/notification.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { authenticatedOnly } from '~/middleware/role.middleware'

const router = Router()

router.use(authMiddleware)

// Get all notifications for current user (with filters)
router.get('/', authenticatedOnly, getNotificationsController)

// Mark specific notification as read
router.put('/:id/read', authenticatedOnly, markNotificationAsReadController)

// Mark all notifications as read
router.put('/read-all', authenticatedOnly, markAllNotificationsAsReadController)

// Delete specific notification
router.delete('/:id', authenticatedOnly, deleteNotificationController)

// Delete all read notifications
router.delete('/read-all', authenticatedOnly, deleteAllReadNotificationsController)

export default router
