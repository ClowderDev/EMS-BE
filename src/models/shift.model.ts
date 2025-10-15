import mongoose, { Document, Schema } from 'mongoose'

export interface ShiftDocument extends Document {
  shiftName: string
  startTime: string // Format: "HH:mm" (e.g., "08:00")
  endTime: string // Format: "HH:mm" (e.g., "17:00")
  branchId: mongoose.Types.ObjectId
  maxEmployees?: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

const shiftSchema = new Schema<ShiftDocument>(
  {
    shiftName: {
      type: String,
      required: true,
      trim: true
    },
    startTime: {
      type: String,
      required: true,
      trim: true
    },
    endTime: {
      type: String,
      required: true,
      trim: true
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    maxEmployees: {
      type: Number,
      min: 1,
      required: false
    },
    description: {
      type: String,
      trim: true,
      required: false
    }
  },
  {
    timestamps: true
  }
)

const ShiftModel = mongoose.model<ShiftDocument>('Shift', shiftSchema)
export default ShiftModel
