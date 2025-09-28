import mongoose, { Document, Schema } from 'mongoose'
import { compareValue, hashValue } from '~/utils/bcrypt'

export interface EmployeeDocument extends Document {
  name: string
  role: 'employee' | 'manager' | 'admin'
  branchId: mongoose.Types.ObjectId
  phone?: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
  comparePassword: (password: string) => Promise<boolean>
  omitPassword: () => Omit<EmployeeDocument, 'password'>
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
      required: false,
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

employeeSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    if (this.password) {
      this.password = await hashValue(this.password)
    }
  }
  next()
})

employeeSchema.methods.omitPassword = function (): Omit<EmployeeDocument, 'password'> {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

employeeSchema.methods.comparePassword = async function (password: string) {
  return compareValue(password, this.password)
}

const EmployeeModel = mongoose.model<EmployeeDocument>('Employee', employeeSchema)
export default EmployeeModel
