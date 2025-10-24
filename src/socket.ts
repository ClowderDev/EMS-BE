import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { getEnv } from './utils/get-env'
import EmployeeModel from './models/employee.model'
import * as messageService from './services/message.service'

interface SocketUser {
  userId: string
  branchId: string
  name: string
  role: string
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser
}

// Store online users: userId -> socketId
const onlineUsers = new Map<string, string>()

// Store user's current room (for direct chats)
const userRooms = new Map<string, string>()

/**
 * Initialize Socket.io server
 */
export const initializeSocketIO = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]

      if (!token) {
        return next(new Error('Authentication token required'))
      }

      // Verify JWT token
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decoded = jwt.verify(token, getEnv('JWT_ACCESS_SECRET')) as any
      const userId = decoded.userId

      // Get user info
      const user = await EmployeeModel.findById(userId).select('name email role branchId').lean()
      if (!user) {
        return next(new Error('User not found'))
      }

      // Attach user info to socket
      socket.user = {
        userId: String(user._id),
        branchId: String(user.branchId),
        name: user.name,
        role: user.role
      }

      next()
    } catch {
      next(new Error('Invalid authentication token'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user!
    console.log(`✅ User connected: ${user.name} (${user.userId})`)

    // Add user to online users
    onlineUsers.set(user.userId, socket.id)

    // Join user's branch room (for group chat)
    const branchRoom = `branch:${user.branchId}`
    socket.join(branchRoom)
    console.log(`👥 ${user.name} joined branch room: ${branchRoom}`)

    // Emit online users to branch
    io.to(branchRoom).emit('user:online', {
      userId: user.userId,
      name: user.name,
      role: user.role
    })

    // Send updated online users list
    const branchOnlineUsers = Array.from(onlineUsers.entries())
      .filter(([userId]) => {
        const socket = io.sockets.sockets.get(onlineUsers.get(userId)!) as AuthenticatedSocket
        return socket?.user?.branchId === user.branchId
      })
      .map(([userId]) => userId)

    io.to(branchRoom).emit('online:users', branchOnlineUsers)

    // ============ DIRECT MESSAGE EVENTS ============

    /**
     * Join a direct chat room with another user
     */
    socket.on('direct:join', ({ userId: otherUserId }) => {
      const roomName = [user.userId, otherUserId].sort().join(':')
      socket.join(roomName)
      userRooms.set(user.userId, roomName)
      console.log(`💬 ${user.name} joined direct chat with ${otherUserId}`)
    })

    /**
     * Send direct message
     */
    socket.on('direct:message', async (data: { receiverId: string; content: string }) => {
      try {
        const { receiverId, content } = data

        // Save message to database
        const message = await messageService.sendDirectMessage({
          senderId: user.userId,
          receiverId,
          branchId: user.branchId,
          content
        })

        // Emit to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('direct:message:received', message)
        }

        // Confirm to sender
        socket.emit('direct:message:sent', message)
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    /**
     * Typing indicator for direct chat
     */
    socket.on('direct:typing', ({ receiverId, isTyping }) => {
      const receiverSocketId = onlineUsers.get(receiverId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('direct:typing', {
          senderId: user.userId,
          senderName: user.name,
          isTyping
        })
      }
    })

    // ============ GROUP MESSAGE EVENTS ============

    /**
     * Send group message to branch
     */
    socket.on('group:message', async (data: { content: string }) => {
      try {
        const { content } = data

        // Save message to database
        const message = await messageService.sendGroupMessage({
          senderId: user.userId,
          branchId: user.branchId,
          content
        })

        // Broadcast to all users in branch (including sender)
        io.to(branchRoom).emit('group:message:received', message)
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    /**
     * Typing indicator for group chat
     */
    socket.on('group:typing', ({ isTyping }) => {
      socket.to(branchRoom).emit('group:typing', {
        senderId: user.userId,
        senderName: user.name,
        isTyping
      })
    })

    // ============ READ RECEIPTS ============

    /**
     * Mark direct messages as read
     */
    socket.on('direct:mark-read', async ({ senderId }) => {
      try {
        await messageService.markDirectMessagesAsRead(user.userId, senderId)

        // Notify sender that messages were read
        const senderSocketId = onlineUsers.get(senderId)
        if (senderSocketId) {
          io.to(senderSocketId).emit('direct:messages-read', {
            readBy: user.userId,
            readByName: user.name
          })
        }
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    // ============ DISCONNECT ============

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${user.name} (${user.userId})`)

      // Remove from online users
      onlineUsers.delete(user.userId)
      userRooms.delete(user.userId)

      // Notify branch that user went offline
      io.to(branchRoom).emit('user:offline', {
        userId: user.userId,
        name: user.name
      })

      // Send updated online users list
      const branchOnlineUsers = Array.from(onlineUsers.entries())
        .filter(([userId]) => {
          const socket = io.sockets.sockets.get(onlineUsers.get(userId)!) as AuthenticatedSocket
          return socket?.user?.branchId === user.branchId
        })
        .map(([userId]) => userId)

      io.to(branchRoom).emit('online:users', branchOnlineUsers)
    })
  })

  console.log('🚀 Socket.IO server initialized')

  return io
}

export { onlineUsers }
