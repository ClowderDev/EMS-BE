import mongoose, { Document, Schema } from 'mongoose'

export interface AttendanceDocument extends Document {
  employeeId: mongoose.Types.ObjectId
  shiftId: mongoose.Types.ObjectId
  registrationId: mongoose.Types.ObjectId
  date: Date
  checkInTime: Date | null
  checkOutTime: Date | null
  checkInLocation: {
    latitude: number
    longitude: number
  } | null
  checkOutLocation: {
    latitude: number
    longitude: number
  } | null
  status: 'checked-in' | 'checked-out' | 'absent'
  notes: string | null
  workHours: number | null
  createdAt: Date
  updatedAt: Date
  calculateWorkHours: () => number | null
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
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShiftRegistration',
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
    checkInLocation: {
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
    checkOutLocation: {
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
    status: {
      type: String,
      enum: ['checked-in', 'checked-out', 'absent'],
      default: 'absent'
    },
    notes: {
      type: String,
      default: null
    },
    workHours: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
)

// Method để tính work hours
attendanceSchema.methods.calculateWorkHours = function (): number | null {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime.getTime() - this.checkInTime.getTime()
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100 // Hours with 2 decimal places
  }
  return null
}

const AttendanceModel = mongoose.model<AttendanceDocument>('Attendance', attendanceSchema)
export default AttendanceModel
