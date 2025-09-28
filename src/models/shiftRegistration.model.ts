import mongoose, { Document, Schema } from 'mongoose';
import { UserDocument } from './user.model';
import { ShiftDocument } from './shift.model';

export interface ShiftRegistrationDocument extends Document {
  employeeId: UserDocument['_id'];
  shiftId: ShiftDocument['_id'];
  date: Date;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reasonForCancellation?: string;
  approvedBy?: UserDocument['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const shiftRegistrationSchema = new Schema<ShiftRegistrationDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: 'Shift',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reasonForCancellation: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const ShiftRegistrationModel = mongoose.model<ShiftRegistrationDocument>(
  'ShiftRegistration',
  shiftRegistrationSchema
);
export default ShiftRegistrationModel;