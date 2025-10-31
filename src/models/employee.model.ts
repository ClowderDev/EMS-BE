import mongoose, { Document, Schema } from 'mongoose'
import { compareValue, hashValue } from '~/utils/bcrypt'

export interface EmployeeDocument extends Document {
  name: string
  username: string // Used for login before email is set
  role: 'employee' | 'manager' | 'admin'
  branchId: mongoose.Types.ObjectId
  phone?: string
  email?: string // Optional: added by user on first login
  password: string
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  emailVerificationCode?: string
  emailVerificationExpires?: Date
  isEmailVerified: boolean
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
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
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
      required: false, // Email is optional (admin creates account without email)
      trim: true,
      lowercase: true,
      sparse: true, // Allow multiple null values but unique non-null values
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    resetPasswordToken: {
      type: String,
      required: false
    },
    resetPasswordExpires: {
      type: Date,
      required: false
    },
    emailVerificationCode: {
      type: String,
      required: false
    },
    emailVerificationExpires: {
      type: Date,
      required: false
    },
    isEmailVerified: {
      type: Boolean,
      default: false
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
