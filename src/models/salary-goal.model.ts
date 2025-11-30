import mongoose, { Document, Schema } from 'mongoose'

export interface SalaryGoalDocument extends Document {
  employeeId: mongoose.Types.ObjectId
  targetShifts: number
  month: number // 1-12
  year: number
  currentShifts: number
  currentEarnings: number
  status: 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

const salaryGoalSchema = new Schema<SalaryGoalDocument>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true
    },
    targetShifts: {
      type: Number,
      required: true,
      min: 1,
      max: 31
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    currentShifts: {
      type: Number,
      default: 0
    },
    currentEarnings: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
)

// Composite unique index - one goal per employee per month/year
salaryGoalSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true })

const SalaryGoalModel = mongoose.model<SalaryGoalDocument>('SalaryGoal', salaryGoalSchema)
export default SalaryGoalModel
