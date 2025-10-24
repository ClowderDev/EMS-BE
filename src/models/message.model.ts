import mongoose, { Document, Schema } from 'mongoose'

export interface MessageDocument extends Document {
  branchId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  receiverId?: mongoose.Types.ObjectId // Optional for group messages
  messageType: 'direct' | 'group' // direct = 1-1, group = branch chat
  content: string
  isRead: boolean
  readBy: mongoose.Types.ObjectId[] // For group messages - track who read
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<MessageDocument>(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: false // Not required for group messages
    },
    messageType: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct'
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      }
    ],
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

// Index for faster queries
messageSchema.index({ branchId: 1, messageType: 1, timestamp: -1 })
messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 })

const MessageModel = mongoose.model<MessageDocument>('Message', messageSchema)
export default MessageModel
