import mongoose, { Document, Schema } from 'mongoose'

export interface BranchDocument extends Document {
  branchName: string
  address: string
  location?: {
    latitude: number
    longitude: number
    radius: number // in meters, for check-in validation
  }
  createdAt: Date
  updatedAt: Date
}

const branchSchema = new Schema<BranchDocument>(
  {
    branchName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    location: {
      type: {
        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90
        },
        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180
        },
        radius: {
          type: Number,
          required: true,
          min: 10,
          max: 10000,
          default: 500 // 500 meters default
        }
      },
      required: false
    }
  },
  {
    timestamps: true
  }
)

const BranchModel = mongoose.model<BranchDocument>('Branch', branchSchema)
export default BranchModel
