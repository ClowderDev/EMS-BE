import { z } from 'zod'

/**
 * Schema for sending direct message
 */
export const sendDirectMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1, 'Receiver ID is required'),
    content: z.string().min(1, 'Message content is required').max(2000, 'Message too long')
  })
})

/**
 * Schema for sending group message
 */
export const sendGroupMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content is required').max(2000, 'Message too long')
  })
})

/**
 * Schema for getting chat history
 */
export const getChatHistorySchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required')
  }),
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional()
  })
})

/**
 * Schema for getting group chat
 */
export const getGroupChatSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional()
  })
})

/**
 * Schema for marking messages as read
 */
export const markAsReadSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required')
  })
})

/**
 * Schema for deleting message
 */
export const deleteMessageSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Message ID is required')
  })
})

export type SendDirectMessageInput = z.infer<typeof sendDirectMessageSchema>
export type SendGroupMessageInput = z.infer<typeof sendGroupMessageSchema>
export type GetChatHistoryInput = z.infer<typeof getChatHistorySchema>
export type GetGroupChatInput = z.infer<typeof getGroupChatSchema>
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>
export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>
