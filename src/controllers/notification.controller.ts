import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.middlerware'
import * as notificationService from '../services/notification.service'
import { HTTPSTATUS } from '../config/http.config'

export const getNotificationsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)
  const { status, limit, page } = req.query

  const filters = {
    status: status as 'unread' | 'read' | undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    page: page ? parseInt(page as string) : undefined
  }

  const result = await notificationService.getUserNotifications(userId, filters)

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: result
  })
})

export const markNotificationAsReadController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)
  const { id } = req.params

  const notification = await notificationService.markAsRead(id, userId)

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  })
})

export const markAllNotificationsAsReadController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)

  const result = await notificationService.markAllAsRead(userId)

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
    data: { modifiedCount: result.modifiedCount }
  })
})

export const deleteNotificationController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)
  const { id } = req.params

  const result = await notificationService.deleteNotification(id, userId)

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message
  })
})

export const deleteAllReadNotificationsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)

  const result = await notificationService.deleteAllRead(userId)

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
    data: { deletedCount: result.deletedCount }
  })
})
