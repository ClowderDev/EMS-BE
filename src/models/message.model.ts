import mongoose, { Document, Schema } from 'mongoose'

export interface MessageDocument extends Document {
  branchId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  receiverId: mongoose.Types.ObjectId
  content: string
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
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

const MessageModel = mongoose.model<MessageDocument>('Message', messageSchema)
export default MessageModel
