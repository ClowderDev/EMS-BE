import mongoose, { Document, Schema } from 'mongoose'

export interface ShiftRegistrationDocument extends Document {
  employeeId: mongoose.Types.ObjectId
  shiftId: mongoose.Types.ObjectId
  date: Date
  status: 'pending' | 'approved' | 'rejected'
  note: string
  createdAt: Date
  updatedAt: Date
}

const shiftRegistrationSchema = new Schema<ShiftRegistrationDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: 'Shift',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    note: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

const ShiftRegistrationModel = mongoose.model<ShiftRegistrationDocument>('ShiftRegistration', shiftRegistrationSchema)
export default ShiftRegistrationModel
