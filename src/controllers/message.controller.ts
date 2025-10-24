import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.middlerware'
import * as messageService from '../services/message.service'
import { HTTPSTATUS } from '../config/http.config'
import EmployeeModel from '../models/employee.model'
import { NotFoundException } from '../utils/app-error'

/**
 * @route   POST /api/v1/messages/direct
 * @desc    Send a direct message to another user
 * @access  Private (All authenticated users)
 */
export const sendDirectMessageController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)
  const { receiverId, content } = req.body

  // Get user's branch
  const user = await EmployeeModel.findById(userId)
  if (!user) {
    throw new NotFoundException('User not found')
  }

  const message = await messageService.sendDirectMessage({
    senderId: userId,
    receiverId,
    branchId: String(user.branchId),
    content
  })

  res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'Message sent successfully',
    data: message
  })
})

/**
 * @route   POST /api/v1/messages/group
 * @desc    Send a group message to branch
 * @access  Private (All authenticated users)
 */
export const sendGroupMessageController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)
  const { content } = req.body

  // Get user's branch
  const user = await EmployeeModel.findById(userId)
  if (!user) {
    throw new NotFoundException('User not found')
  }

  const message = await messageService.sendGroupMessage({
    senderId: userId,
    branchId: String(user.branchId),
    content
  })

  res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'Group message sent successfully',
    data: message
  })
})

/**
 * @route   GET /api/v1/messages/conversations
 * @desc    Get list of conversations
 * @access  Private (All authenticated users)
 */
export const getConversationsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)

  const conversations = await messageService.getConversations(userId)

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Conversations retrieved successfully',
    data: conversations
  })
})

/**
 * @route   GET /api/v1/messages/direct/:userId
 * @desc    Get chat history with specific user
 * @access  Private (All authenticated users)
 */
export const getDirectChatHistoryController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)
  const { userId: otherUserId } = req.params
  const { limit, page } = req.query

  const result = await messageService.getDirectChatHistory(
    userId,
    otherUserId,
    limit ? parseInt(limit as string) : undefined,
    page ? parseInt(page as string) : undefined
  )

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Chat history retrieved successfully',
    data: result
  })
})

/**
 * @route   GET /api/v1/messages/group
 * @desc    Get group chat history
 * @access  Private (All authenticated users)
 */
export const getGroupChatHistoryController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)
  const { limit, page } = req.query

  const result = await messageService.getGroupChatHistory(
    userId,
    limit ? parseInt(limit as string) : undefined,
    page ? parseInt(page as string) : undefined
  )

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Group chat history retrieved successfully',
    data: result
  })
})

/**
 * @route   PUT /api/v1/messages/direct/:userId/read
 * @desc    Mark messages from a user as read
 * @access  Private (All authenticated users)
 */
export const markDirectMessagesAsReadController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)
  const { userId: otherUserId } = req.params

  const result = await messageService.markDirectMessagesAsRead(userId, otherUserId)

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message,
    data: { modifiedCount: result.modifiedCount }
  })
})

/**
 * @route   DELETE /api/v1/messages/:id
 * @desc    Delete a message
 * @access  Private (Message sender only)
 */
export const deleteMessageController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)
  const { id } = req.params

  const result = await messageService.deleteMessage(id, userId)

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: result.message
  })
})

/**
 * @route   GET /api/v1/messages/unread-count
 * @desc    Get unread message count
 * @access  Private (All authenticated users)
 */
export const getUnreadCountController = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.user!._id)

  const result = await messageService.getUnreadCount(userId)

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Unread count retrieved successfully',
    data: result
  })
})
