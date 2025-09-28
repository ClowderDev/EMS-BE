import mongoose, { Document, Schema } from 'mongoose'

export interface NotificationDocument extends Document {
  employeeId: mongoose.Types.ObjectId
  title: string
  message: string
  date: Date
  status: 'unread' | 'read'
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread'
    }
  },
  {
    timestamps: true
  }
)

const NotificationModel = mongoose.model<NotificationDocument>('Notification', notificationSchema)
export default NotificationModel
