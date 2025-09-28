import mongoose, { Document, Schema } from 'mongoose'

export interface AttendanceDocument extends Document {
  employeeId: mongoose.Types.ObjectId
  shiftId: mongoose.Types.ObjectId
  date: Date
  checkInTime: Date | null
  checkOutTime: Date | null
  status: 'present' | 'absent' | 'on leave'
  location: {
    latitude: number
    longitude: number
  } | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

const attendanceSchema = new Schema<AttendanceDocument>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    checkInTime: {
      type: Date,
      default: null
    },
    checkOutTime: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'on leave'],
      required: true
    },
    location: {
      type: {
        latitude: {
          type: Number,
          required: true
        },
        longitude: {
          type: Number,
          required: true
        }
      },
      default: null
    },
    notes: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
)

const AttendanceModel = mongoose.model<AttendanceDocument>('Attendance', attendanceSchema)
export default AttendanceModel
