import type mongoose from 'mongoose'
import type { EmployeeDocument } from './models/employee.model'

declare global {
  namespace Express {
    interface User extends EmployeeDocument {
      _id: mongoose.Types.ObjectId | string
    }
    interface Request {
      user?: User
    }
  }
}
