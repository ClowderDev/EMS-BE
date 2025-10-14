import BranchModel from '~/models/branch.model'
import EmployeeModel from '~/models/employee.model'
import { BadRequestException, NotFoundException } from '~/utils/app-error'
import {
  CreateBranchSchemaType,
  UpdateBranchSchemaType,
  GetBranchesQuerySchemaType
} from '~/validation/branch.validator'

// Lấy danh sách chi nhánh với pagination và search
export const getBranches = async (query: GetBranchesQuerySchemaType) => {
  const { page, limit, search, sortBy, order } = query

  // Build filter query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {}
  if (search) {
    filter.$or = [
      { branchName: { $regex: search, $options: 'i' } }, // Case-insensitive
      { address: { $regex: search, $options: 'i' } }
    ]
  }

  // Build sort object
  const sort: Record<string, 1 | -1> = {}
  sort[sortBy] = order === 'asc' ? 1 : -1

  // Calculate pagination
  const skip = (page - 1) * limit

  // Execute query
  const [branches, total] = await Promise.all([
    BranchModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    BranchModel.countDocuments(filter)
  ])

  return {
    branches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export const getBranchById = async (id: string) => {
  const branch = await BranchModel.findById(id).lean()

  if (!branch) {
    throw new NotFoundException('Branch not found')
  }

  return branch
}

export const createBranch = async (data: CreateBranchSchemaType) => {
  const { branchName, address } = data

  const existingBranch = await BranchModel.findOne({ branchName })
  if (existingBranch) {
    throw new BadRequestException('Branch name already exists')
  }

  const newBranch = new BranchModel({
    branchName,
    address
  })

  await newBranch.save()

  return newBranch.toObject()
}

export const updateBranch = async (id: string, data: UpdateBranchSchemaType) => {
  const branch = await BranchModel.findById(id)
  if (!branch) {
    throw new NotFoundException('Branch not found')
  }

  // Nếu update branchName, kiểm tra trùng
  if (data.branchName && data.branchName !== branch.branchName) {
    const existingBranch = await BranchModel.findOne({
      branchName: data.branchName,
      _id: { $ne: id }
    })

    if (existingBranch) {
      throw new BadRequestException('Branch name already exists')
    }
  }

  const updatedBranch = await BranchModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).lean()

  return updatedBranch
}

export const deleteBranch = async (id: string) => {
  // Kiểm tra chi nhánh tồn tại
  const branch = await BranchModel.findById(id)
  if (!branch) {
    throw new NotFoundException('Branch not found')
  }

  const employeeCount = await EmployeeModel.countDocuments({ branchId: id })
  if (employeeCount > 0) {
    throw new BadRequestException('Cannot delete branch with existing employees')
  }

  await BranchModel.findByIdAndDelete(id)

  return {
    message: 'Branch deleted successfully'
  }
}
