import mongoose, { Document, Schema } from 'mongoose'

export interface EmployeeDocument extends Document {
  name: string
  role: 'employee' | 'manager' | 'admin'
  branchId: mongoose.Types.ObjectId
  phone: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

const employeeSchema = new Schema<EmployeeDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['employee', 'manager', 'admin'],
      required: true
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const EmployeeModel = mongoose.model<EmployeeDocument>('Employee', employeeSchema)
export default EmployeeModel
