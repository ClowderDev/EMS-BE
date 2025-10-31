import mongoose, { Document, Schema } from 'mongoose'

export interface ViolationDocument extends Document {
  employeeId: mongoose.Types.ObjectId
  branchId: mongoose.Types.ObjectId
  shiftId?: mongoose.Types.ObjectId
  title: string
  description: string
  violationDate: Date
  penaltyAmount: number
  status: 'pending' | 'acknowledged' | 'resolved'
  createdBy: mongoose.Types.ObjectId // Manager who created the violation
  acknowledgedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const violationSchema = new Schema<ViolationDocument>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      required: false
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    violationDate: {
      type: Date,
      required: true,
      index: true
    },
    penaltyAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'resolved'],
      default: 'pending'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    acknowledgedAt: {
      type: Date,
      required: false
    },
    notes: {
      type: String,
      required: false,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

// Index for employee queries
violationSchema.index({ employeeId: 1, violationDate: -1 })
violationSchema.index({ branchId: 1, violationDate: -1 })

const ViolationModel = mongoose.model<ViolationDocument>('Violation', violationSchema)
export default ViolationModel
