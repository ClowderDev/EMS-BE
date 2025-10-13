import type mongoose from 'mongoose'
import type { UserDocument } from '../../models/user.model'

declare global {
  namespace Express {
    interface User extends UserDocument {
      _id: mongoose.Types.ObjectId | string
    }
    interface Request {
      user?: User
    }
  }
}
