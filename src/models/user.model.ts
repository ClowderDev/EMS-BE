import mongoose, { Document, Schema } from 'mongoose';
import { BranchDocument } from './branch.model';

export interface UserDocument extends Document {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  role: 'admin' | 'manager' | 'employee';
  branchId?: BranchDocument['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'employee'],
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<UserDocument>('User', userSchema);
export default UserModel;