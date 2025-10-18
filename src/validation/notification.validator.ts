import { z } from 'zod'

/**
 * Schema for getting notifications with query filters
 */
export const getNotificationsSchema = z.object({
  query: z.object({
    status: z.enum(['unread', 'read']).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional()
  })
})

/**
 * Schema for marking notification as read
 */
export const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Notification ID is required')
  })
})

/**
 * Schema for deleting notification
 */
export const deleteNotificationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Notification ID is required')
  })
})

/**
 * Schema for creating notification (internal use)
 */
export const createNotificationSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    message: z.string().min(1, 'Message is required').max(1000, 'Message too long')
  })
})

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>
export type DeleteNotificationInput = z.infer<typeof deleteNotificationSchema>
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
