import mongoose from 'mongoose'
import MessageModel from '../models/message.model'
import EmployeeModel from '../models/employee.model'
import { NotFoundException, BadRequestException, ForbiddenException } from '../utils/app-error'

interface SendDirectMessageData {
  senderId: string
  receiverId: string
  branchId: string
  content: string
}

interface SendGroupMessageData {
  senderId: string
  branchId: string
  content: string
}

/**
 * Send a direct message (1-1 chat)
 */
export const sendDirectMessage = async (data: SendDirectMessageData) => {
  const { senderId, receiverId, branchId, content } = data

  // Validate receiver exists
  const receiver = await EmployeeModel.findById(receiverId)
  if (!receiver) {
    throw new NotFoundException('Receiver not found')
  }

  // Validate both users are in the same branch
  const sender = await EmployeeModel.findById(senderId)
  if (!sender) {
    throw new NotFoundException('Sender not found')
  }

  if (sender.branchId.toString() !== receiver.branchId.toString()) {
    throw new ForbiddenException('You can only message employees in your branch')
  }

  // Create message
  const message = await MessageModel.create({
    branchId,
    senderId,
    receiverId,
    messageType: 'direct',
    content,
    isRead: false,
    readBy: [],
    timestamp: new Date()
  })

  // Populate sender and receiver info
  await message.populate('senderId', 'name email role')
  await message.populate('receiverId', 'name email role')

  return message
}

/**
 * Send a group message (branch chat)
 */
export const sendGroupMessage = async (data: SendGroupMessageData) => {
  const { senderId, branchId, content } = data

  // Validate sender exists and belongs to branch
  const sender = await EmployeeModel.findById(senderId)
  if (!sender) {
    throw new NotFoundException('Sender not found')
  }

  if (sender.branchId.toString() !== branchId) {
    throw new ForbiddenException('You can only send messages to your branch')
  }

  // Create group message
  const message = await MessageModel.create({
    branchId,
    senderId,
    receiverId: null,
    messageType: 'group',
    content,
    isRead: false,
    readBy: [senderId], // Sender has "read" it
    timestamp: new Date()
  })

  // Populate sender info
  await message.populate('senderId', 'name email role')

  return message
}

/**
 * Get conversations list for a user
 */
export const getConversations = async (userId: string) => {
  const user = await EmployeeModel.findById(userId)
  if (!user) {
    throw new NotFoundException('User not found')
  }

  // Get all users in the same branch (potential conversations)
  const branchUsers = await EmployeeModel.find({
    branchId: user.branchId,
    _id: { $ne: userId } // Exclude self
  })
    .select('name email role')
    .lean()

  // Get last message with each user
  const conversations = await Promise.all(
    branchUsers.map(async (otherUser) => {
      const lastMessage = await MessageModel.findOne({
        branchId: user.branchId,
        messageType: 'direct',
        $or: [
          { senderId: userId, receiverId: otherUser._id },
          { senderId: otherUser._id, receiverId: userId }
        ]
      })
        .sort({ timestamp: -1 })
        .lean()

      // Count unread messages from this user
      const unreadCount = await MessageModel.countDocuments({
        branchId: user.branchId,
        senderId: otherUser._id,
        receiverId: userId,
        messageType: 'direct',
        isRead: false
      })

      return {
        user: otherUser,
        lastMessage: lastMessage || null,
        unreadCount
      }
    })
  )

  // Sort by last message timestamp
  conversations.sort((a, b) => {
    const aTime = a.lastMessage?.timestamp || new Date(0)
    const bTime = b.lastMessage?.timestamp || new Date(0)
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  return conversations
}

/**
 * Get chat history (direct messages between two users)
 */
export const getDirectChatHistory = async (userId: string, otherUserId: string, limit = 50, page = 1) => {
  const user = await EmployeeModel.findById(userId)
  if (!user) {
    throw new NotFoundException('User not found')
  }

  const otherUser = await EmployeeModel.findById(otherUserId)
  if (!otherUser) {
    throw new NotFoundException('Other user not found')
  }

  // Validate same branch
  if (user.branchId.toString() !== otherUser.branchId.toString()) {
    throw new ForbiddenException('You can only view messages from users in your branch')
  }

  const skip = (page - 1) * limit

  // Get messages between two users
  const [messages, totalCount] = await Promise.all([
    MessageModel.find({
      branchId: user.branchId,
      messageType: 'direct',
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .lean(),
    MessageModel.countDocuments({
      branchId: user.branchId,
      messageType: 'direct',
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
  ])

  // Reverse to show oldest first
  messages.reverse()

  return {
    messages,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }
  }
}

/**
 * Get group chat history (branch messages)
 */
export const getGroupChatHistory = async (userId: string, limit = 50, page = 1) => {
  const user = await EmployeeModel.findById(userId)
  if (!user) {
    throw new NotFoundException('User not found')
  }

  const skip = (page - 1) * limit

  // Get group messages for this branch
  const [messages, totalCount] = await Promise.all([
    MessageModel.find({
      branchId: user.branchId,
      messageType: 'group'
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name email role')
      .lean(),
    MessageModel.countDocuments({
      branchId: user.branchId,
      messageType: 'group'
    })
  ])

  // Reverse to show oldest first
  messages.reverse()

  return {
    messages,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }
  }
}

/**
 * Mark direct messages as read
 */
export const markDirectMessagesAsRead = async (userId: string, otherUserId: string) => {
  const result = await MessageModel.updateMany(
    {
      senderId: otherUserId,
      receiverId: userId,
      messageType: 'direct',
      isRead: false
    },
    {
      isRead: true
    }
  )

  return {
    message: 'Messages marked as read',
    modifiedCount: result.modifiedCount
  }
}

/**
 * Mark group message as read by user
 */
export const markGroupMessageAsRead = async (messageId: string, userId: string) => {
  const message = await MessageModel.findById(messageId)
  if (!message) {
    throw new NotFoundException('Message not found')
  }

  if (message.messageType !== 'group') {
    throw new BadRequestException('This is not a group message')
  }

  // Add user to readBy array if not already there
  if (!message.readBy.includes(new mongoose.Types.ObjectId(userId))) {
    message.readBy.push(new mongoose.Types.ObjectId(userId))
    await message.save()
  }

  return message
}

/**
 * Delete a message (sender only)
 */
export const deleteMessage = async (messageId: string, userId: string) => {
  const message = await MessageModel.findById(messageId)
  if (!message) {
    throw new NotFoundException('Message not found')
  }

  // Only sender can delete
  if (message.senderId.toString() !== userId) {
    throw new ForbiddenException('You can only delete your own messages')
  }

  await MessageModel.findByIdAndDelete(messageId)

  return { message: 'Message deleted successfully' }
}

/**
 * Get unread count for user
 */
export const getUnreadCount = async (userId: string) => {
  const user = await EmployeeModel.findById(userId)
  if (!user) {
    throw new NotFoundException('User not found')
  }

  // Count unread direct messages
  const unreadDirectCount = await MessageModel.countDocuments({
    receiverId: userId,
    messageType: 'direct',
    isRead: false
  })

  // Count unread group messages (not in readBy array)
  const unreadGroupCount = await MessageModel.countDocuments({
    branchId: user.branchId,
    messageType: 'group',
    senderId: { $ne: userId },
    readBy: { $ne: userId }
  })

  return {
    directMessages: unreadDirectCount,
    groupMessages: unreadGroupCount,
    total: unreadDirectCount + unreadGroupCount
  }
}
