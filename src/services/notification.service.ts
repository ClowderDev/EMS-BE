import mongoose from 'mongoose'
import NotificationModel from '../models/notification.model'
import EmployeeModel from '../models/employee.model'
import { NotFoundException, ForbiddenException } from '../utils/app-error'

interface CreateNotificationData {
  employeeId: string | mongoose.Types.ObjectId
  title: string
  message: string
}

interface GetNotificationsFilters {
  status?: 'unread' | 'read'
  limit?: number
  page?: number
}

export const createNotification = async (data: CreateNotificationData) => {
  const { employeeId, title, message } = data

  const employee = await EmployeeModel.findById(employeeId)
  if (!employee) {
    throw new NotFoundException('Employee not found')
  }

  const notification = await NotificationModel.create({
    employeeId,
    title,
    message,
    status: 'unread',
    date: new Date()
  })

  return notification
}

export const getUserNotifications = async (userId: string, filters: GetNotificationsFilters = {}) => {
  const { status, limit = 20, page = 1 } = filters

  interface QueryFilter {
    employeeId: string
    status?: 'unread' | 'read'
  }
  const query: QueryFilter = { employeeId: userId }
  if (status) {
    query.status = status
  }

  const skip = (page - 1) * limit

  const [notifications, totalCount] = await Promise.all([
    NotificationModel.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit)
      .skip(skip)
      .lean(),
    NotificationModel.countDocuments(query)
  ])
  const unreadCount = await NotificationModel.countDocuments({
    employeeId: userId,
    status: 'unread'
  })

  return {
    notifications,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    },
    unreadCount
  }
}

export const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await NotificationModel.findById(notificationId)

  if (!notification) {
    throw new NotFoundException('Notification not found')
  }

  if (String(notification.employeeId) !== userId) {
    throw new ForbiddenException('You can only mark your own notifications as read')
  }

  notification.status = 'read'
  await notification.save()

  return notification
}

export const markAllAsRead = async (userId: string) => {
  const result = await NotificationModel.updateMany({ employeeId: userId, status: 'unread' }, { status: 'read' })

  return {
    message: 'All notifications marked as read',
    modifiedCount: result.modifiedCount
  }
}

export const deleteNotification = async (notificationId: string, userId: string) => {
  const notification = await NotificationModel.findById(notificationId)

  if (!notification) {
    throw new NotFoundException('Notification not found')
  }

  if (String(notification.employeeId) !== userId) {
    throw new ForbiddenException('You can only delete your own notifications')
  }

  await NotificationModel.findByIdAndDelete(notificationId)

  return { message: 'Notification deleted successfully' }
}

export const deleteAllRead = async (userId: string) => {
  const result = await NotificationModel.deleteMany({
    employeeId: userId,
    status: 'read'
  })

  return {
    message: 'All read notifications deleted',
    deletedCount: result.deletedCount
  }
}

export const notifyShiftApproved = async (
  employeeId: string | mongoose.Types.ObjectId,
  shiftDate: Date,
  shiftTime: string
) => {
  return createNotification({
    employeeId,
    title: 'Shift Registration Approved',
    message: `Your shift registration for ${shiftDate.toLocaleDateString()} (${shiftTime}) has been approved.`
  })
}

export const notifyShiftRejected = async (
  employeeId: string | mongoose.Types.ObjectId,
  shiftDate: Date,
  shiftTime: string,
  reason?: string
) => {
  const reasonText = reason ? ` Reason: ${reason}` : ''
  return createNotification({
    employeeId,
    title: 'Shift Registration Rejected',
    message: `Your shift registration for ${shiftDate.toLocaleDateString()} (${shiftTime}) has been rejected.${reasonText}`
  })
}

export const notifyShiftReminder = async (
  employeeId: string | mongoose.Types.ObjectId,
  shiftDate: Date,
  shiftTime: string,
  hoursBeforeShift: number = 24
) => {
  return createNotification({
    employeeId,
    title: 'Upcoming Shift Reminder',
    message: `You have a shift scheduled for ${shiftDate.toLocaleDateString()} (${shiftTime}) in ${hoursBeforeShift} hours.`
  })
}

/**
 * Helper: Create new shift registration notification for manager
 */
export const notifyNewShiftRegistration = async (
  managerId: string | mongoose.Types.ObjectId,
  employeeName: string,
  shiftDate: Date,
  shiftTime: string
) => {
  return createNotification({
    employeeId: managerId,
    title: '📋 New Shift Registration',
    message: `${employeeName} has registered for shift on ${shiftDate.toLocaleDateString()} (${shiftTime}). Please review and approve.`
  })
}
