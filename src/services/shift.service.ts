import mongoose from 'mongoose'
import ShiftModel from '~/models/shift.model'
import BranchModel from '~/models/branch.model'
import { BadRequestException, NotFoundException, ForbiddenException } from '~/utils/app-error'
import { CreateShiftSchemaType, UpdateShiftSchemaType, GetShiftsQuerySchemaType } from '~/validation/shift.validator'
import ShiftRegistrationModel from '~/models/shift_registration.model'

type RequestUser = {
  _id: string
  role: 'admin' | 'manager' | 'employee'
  branchId: mongoose.Types.ObjectId
}
export const getShifts = async (query: GetShiftsQuerySchemaType, requestUser: RequestUser) => {
  const { page, limit, search, branchId, sortBy, order } = query

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {}

  if (requestUser.role === 'manager') {
    filter.branchId = requestUser.branchId
  }

  // Filter theo branchId nếu có (Admin có thể filter)
  if (branchId) {
    if (mongoose.Types.ObjectId.isValid(branchId)) {
      filter.branchId = new mongoose.Types.ObjectId(branchId)
    } else {
      return {
        shifts: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      }
    }
  }

  // Search theo tên shift
  if (search) {
    filter.shiftName = { $regex: search, $options: 'i' }
  }

  // Build sort object
  const sort: Record<string, 1 | -1> = {}
  sort[sortBy] = order === 'asc' ? 1 : -1

  // Calculate pagination
  const skip = (page - 1) * limit

  // Execute query
  const [shifts, total] = await Promise.all([
    ShiftModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    ShiftModel.countDocuments(filter)
  ])

  const shiftsWithBranch = await Promise.all(
    shifts.map(async (shift) => {
      if (shift.branchId && mongoose.Types.ObjectId.isValid(shift.branchId.toString())) {
        try {
          const branch = await BranchModel.findById(shift.branchId).select('branchName address').lean()
          return { ...shift, branchId: branch || shift.branchId }
        } catch {
          return shift
        }
      }
      return shift
    })
  )

  return {
    shifts: shiftsWithBranch,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export const getShiftById = async (id: string, requestUser: RequestUser) => {
  const shift = await ShiftModel.findById(id).lean()

  if (!shift) {
    throw new NotFoundException('Shift not found')
  }

  // Manager chỉ xem shifts trong chi nhánh của mình
  if (requestUser.role === 'manager') {
    if (shift.branchId.toString() !== requestUser.branchId.toString()) {
      throw new ForbiddenException('You can only view shifts in your branch')
    }
  }

  // Populate branch nếu valid
  if (shift.branchId && mongoose.Types.ObjectId.isValid(shift.branchId.toString())) {
    try {
      const branch = await BranchModel.findById(shift.branchId).select('branchName address').lean()
      if (branch) {
        return { ...shift, branchId: branch }
      }
    } catch {
      // Return shift without populate
    }
  }

  return shift
}

export const createShift = async (data: CreateShiftSchemaType, requestUser: RequestUser) => {
  const { shiftName, startTime, endTime, branchId, maxEmployees, description } = data

  // Manager chỉ có thể tạo shift trong chi nhánh của mình
  if (requestUser.role === 'manager') {
    if (branchId !== requestUser.branchId.toString()) {
      throw new ForbiddenException('You can only create shifts in your branch')
    }
  }

  // Kiểm tra branch tồn tại
  const branch = await BranchModel.findById(branchId)
  if (!branch) {
    throw new NotFoundException('Branch not found')
  }

  // Kiểm tra trùng shift name trong cùng chi nhánh
  const existingShift = await ShiftModel.findOne({
    shiftName: { $regex: new RegExp(`^${shiftName}$`, 'i') },
    branchId: new mongoose.Types.ObjectId(branchId)
  })

  if (existingShift) {
    throw new BadRequestException('Shift name already exists in this branch')
  }

  // Tạo shift mới
  const newShift = new ShiftModel({
    shiftName,
    startTime,
    endTime,
    branchId: new mongoose.Types.ObjectId(branchId),
    maxEmployees,
    description
  })

  await newShift.save()

  return newShift.toObject()
}

export const updateShift = async (id: string, data: UpdateShiftSchemaType, requestUser: RequestUser) => {
  const shift = await ShiftModel.findById(id)
  if (!shift) {
    throw new NotFoundException('Shift not found')
  }

  // Manager chỉ có thể update shift trong chi nhánh của mình
  if (requestUser.role === 'manager') {
    if (shift.branchId.toString() !== requestUser.branchId.toString()) {
      throw new ForbiddenException('You can only update shifts in your branch')
    }

    // Manager không được đổi branch
    if (data.branchId) {
      throw new ForbiddenException('You cannot change shift branch')
    }
  }

  // Nếu update branchId, kiểm tra branch tồn tại
  if (data.branchId) {
    const branch = await BranchModel.findById(data.branchId)
    if (!branch) {
      throw new NotFoundException('Branch not found')
    }
  }

  // Nếu update shiftName, kiểm tra trùng
  if (data.shiftName && data.shiftName !== shift.shiftName) {
    const targetBranchId = data.branchId || shift.branchId
    const existingShift = await ShiftModel.findOne({
      shiftName: { $regex: new RegExp(`^${data.shiftName}$`, 'i') },
      branchId: targetBranchId,
      _id: { $ne: id }
    })

    if (existingShift) {
      throw new BadRequestException('Shift name already exists in this branch')
    }
  }

  // Update
  const updatedShift = await ShiftModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).lean()

  return updatedShift
}

export const deleteShift = async (id: string) => {
  const shift = await ShiftModel.findById(id)
  if (!shift) {
    throw new NotFoundException('Shift not found')
  }

  const registrationCount = await ShiftRegistrationModel.countDocuments({ shiftId: id })
  if (registrationCount > 0) {
    throw new BadRequestException('Cannot delete shift with existing registrations')
  }

  await ShiftModel.findByIdAndDelete(id)

  return {
    message: 'Shift deleted successfully'
  }
}
