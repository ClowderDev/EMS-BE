import mongoose, { Document, Schema } from 'mongoose';
import { UserDocument } from './user.model';
import { ShiftRegistrationDocument } from './shiftRegistration.model';

export interface TimesheetDocument extends Document {
  employeeId: UserDocument['_id'];
  registrationId: ShiftRegistrationDocument['_id'];
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
  checkOutLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
  workHours: number;
  lateMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const timesheetSchema = new Schema<TimesheetDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'ShiftRegistration',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    checkInLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    checkOutLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    workHours: {
      type: Number,
      default: 0,
    },
    lateMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const TimesheetModel = mongoose.model<TimesheetDocument>(
  'Timesheet',
  timesheetSchema
);
export default TimesheetModel;
