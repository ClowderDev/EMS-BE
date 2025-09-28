import mongoose, { Document, Schema } from 'mongoose'

export interface BranchDocument extends Document {
  branchName: string
  address: string
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
    }
  },
  {
    timestamps: true
  }
)

const BranchModel = mongoose.model<BranchDocument>('Branch', branchSchema)
export default BranchModel
