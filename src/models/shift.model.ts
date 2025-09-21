import mongoose, { Document, Schema } from 'mongoose'

export interface ShiftDocument extends Document {
  shiftName: string
  startTime: string
  endTime: string
  createdAt: Date
  updatedAt: Date
}

const shiftSchema = new Schema<ShiftDocument>(
  {
    shiftName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
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
    }
  },
  {
    timestamps: true
  }
)

const ShiftModel = mongoose.model<ShiftDocument>('Shift', shiftSchema)
export default ShiftModel
