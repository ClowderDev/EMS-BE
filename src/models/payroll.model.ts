import mongoose, { Document, Schema } from 'mongoose'

export interface PayrollDocument extends Document {
  employeeId: mongoose.Types.ObjectId
  branchId: mongoose.Types.ObjectId
  month: number // 1-12
  year: number
  baseSalary: number
  totalWorkHours: number
  overtimeHours: number
  overtimeRate: number
  overtimePay: number
  bonuses: number
  deductions: {
    violations: number
    lateDeductions: number
    absences: number
    other: number
  }
  grossSalary: number
  netSalary: number
  status: 'draft' | 'pending' | 'approved' | 'paid'
  paidAt?: Date
  paidBy?: mongoose.Types.ObjectId
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const payrollSchema = new Schema<PayrollDocument>(
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
    baseSalary: {
      type: Number,
      required: true,
      min: 0
    },
    totalWorkHours: {
      type: Number,
      required: true,
      default: 0
    },
    overtimeHours: {
      type: Number,
      default: 0
    },
    overtimeRate: {
      type: Number,
      default: 1.5 // 1.5x normal rate
    },
    overtimePay: {
      type: Number,
      default: 0
    },
    bonuses: {
      type: Number,
      default: 0
    },
    deductions: {
      violations: {
        type: Number,
        default: 0
      },
      lateDeductions: {
        type: Number,
        default: 0
      },
      absences: {
        type: Number,
        default: 0
      },
      other: {
        type: Number,
        default: 0
      }
    },
    grossSalary: {
      type: Number,
      required: true
    },
    netSalary: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'paid'],
      default: 'draft'
    },
    paidAt: {
      type: Date,
      required: false
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
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

// Composite unique index - one payroll per employee per month/year
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true })
payrollSchema.index({ branchId: 1, month: 1, year: 1 })
payrollSchema.index({ status: 1 })

const PayrollModel = mongoose.model<PayrollDocument>('Payroll', payrollSchema)
export default PayrollModel
