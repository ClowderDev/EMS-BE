import mongoose from 'mongoose'
import ShiftRegistrationModel from '../models/shift_registration.model'
import ShiftModel from '../models/shift.model'
import EmployeeModel from '../models/employee.model'
import { NotFoundException, BadRequestException, ForbiddenException } from '../utils/app-error'
import { notifyShiftApproved, notifyShiftRejected, notifyNewShiftRegistration } from './notification.service'
import {
  CreateShiftRegistrationSchemaType,
  GetRegistrationsQuerySchemaType,
  UpdateRegistrationStatusSchemaType
} from '~/validation/shift-registration.validator'

type RequestUser = {
  _id: string
  role: 'admin' | 'manager' | 'employee'
  branchId: mongoose.Types.ObjectId
}

// Helper: Parse date string to UTC midnight để tránh timezone issues
const parseToUTCDate = (dateString: string | Date): Date => {
  const inputDate = new Date(dateString)

  // Tạo date ở UTC midnight (00:00:00) dựa trên year/month/day của input
  return new Date(Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 0, 0, 0, 0))
}

// Helper: Kiểm tra conflict thời gian ca làm việc
const checkShiftTimeConflict = async (employeeId: string, shiftId: string, date: Date): Promise<void> => {
  // Lấy thông tin shift mới
  const newShift = await ShiftModel.findById(shiftId)
  if (!newShift) {
    throw new NotFoundException('Shift not found')
  }

  // Lấy tất cả registrations đã approved của employee trong ngày này
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const existingRegistrations = await ShiftRegistrationModel.find({
    employeeId: new mongoose.Types.ObjectId(employeeId),
    date: {
      $gte: startOfDay,
      $lt: endOfDay
    },
    status: { $in: ['pending', 'approved'] }
  }).lean()

  // Kiểm tra conflict với từng shift đã đăng ký
  for (const registration of existingRegistrations) {
    const existingShift = await ShiftModel.findById(registration.shiftId)
    if (!existingShift) continue

    // Convert time string to minutes
    const [newStartH, newStartM] = newShift.startTime.split(':').map(Number)
    const [newEndH, newEndM] = newShift.endTime.split(':').map(Number)
    const [existStartH, existStartM] = existingShift.startTime.split(':').map(Number)
    const [existEndH, existEndM] = existingShift.endTime.split(':').map(Number)

    const newStart = newStartH * 60 + newStartM
    const newEnd = newEndH * 60 + newEndM
    const existStart = existStartH * 60 + existStartM
    const existEnd = existEndH * 60 + existEndM

    // Kiểm tra overlap: (newStart < existEnd) && (newEnd > existStart)
    if (newStart < existEnd && newEnd > existStart) {
      throw new BadRequestException(
        `Shift time conflicts with another registered shift: ${existingShift.shiftName} (${existingShift.startTime} - ${existingShift.endTime})`
      )
    }
  }
}

// Lấy danh sách registrations
export const getRegistrations = async (query: GetRegistrationsQuerySchemaType, requestUser: RequestUser) => {
  const { page, limit, status, shiftId, employeeId, date, sortBy, order } = query

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {}

  // Employee chỉ xem registrations của mình
  if (requestUser.role === 'employee') {
    filter.employeeId = new mongoose.Types.ObjectId(String(requestUser._id))
  }

  // Manager chỉ xem registrations của nhân viên trong chi nhánh
  if (requestUser.role === 'manager') {
    const employeesInBranch = await EmployeeModel.find({ branchId: requestUser.branchId }).select('_id').lean()
    const employeeIds = employeesInBranch.map((emp) => emp._id)
    filter.employeeId = { $in: employeeIds }
  }

  // Filter theo status
  if (status) {
    filter.status = status
  }

  // Filter theo shiftId
  if (shiftId) {
    if (mongoose.Types.ObjectId.isValid(shiftId)) {
      filter.shiftId = new mongoose.Types.ObjectId(shiftId)
    } else {
      return {
        registrations: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      }
    }
  }

  // Filter theo employeeId (Admin có thể filter)
  if (employeeId && requestUser.role === 'admin') {
    if (mongoose.Types.ObjectId.isValid(employeeId)) {
      filter.employeeId = new mongoose.Types.ObjectId(employeeId)
    } else {
      return {
        registrations: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      }
    }
  }

  // Filter theo date (ngày cụ thể)
  if (date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    filter.date = {
      $gte: startOfDay,
      $lt: endOfDay
    }
  }

  // Build sort
  const sort: Record<string, 1 | -1> = {}
  sort[sortBy] = order === 'asc' ? 1 : -1

  const skip = (page - 1) * limit

  const [registrations, total] = await Promise.all([
    ShiftRegistrationModel.find(filter)
      .populate('employeeId', 'name email role branchId')
      .populate('shiftId', 'shiftName startTime endTime branchId')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    ShiftRegistrationModel.countDocuments(filter)
  ])

  return {
    registrations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// Đăng ký ca làm việc (Employee)
export const createRegistration = async (data: CreateShiftRegistrationSchemaType, requestUser: RequestUser) => {
  const { shiftId, date, note } = data

  // Validate shift exists
  const shift = await ShiftModel.findById(shiftId)
  if (!shift) {
    throw new NotFoundException('Shift not found')
  }

  // Kiểm tra requestUser có branchId
  if (!requestUser.branchId) {
    throw new BadRequestException('Employee must be assigned to a branch to register for shifts')
  }

  // Employee chỉ đăng ký ca trong chi nhánh của mình
  if (requestUser.branchId.toString() !== shift.branchId.toString()) {
    throw new ForbiddenException('You can only register for shifts in your branch')
  }

  // Parse date to UTC midnight để tránh timezone issues
  const registrationDate = parseToUTCDate(date)

  // Kiểm tra không đăng ký ca trong quá khứ
  const today = new Date()
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0))

  if (registrationDate < todayUTC) {
    throw new BadRequestException('Cannot register for shifts in the past')
  }

  // Kiểm tra đã đăng ký shift này trong ngày chưa
  const employeeIdStr = String(requestUser._id)

  const startOfDay = new Date(registrationDate)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(registrationDate)
  endOfDay.setHours(23, 59, 59, 999)

  const existingRegistration = await ShiftRegistrationModel.findOne({
    employeeId: new mongoose.Types.ObjectId(employeeIdStr),
    shiftId: new mongoose.Types.ObjectId(shiftId),
    date: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  })

  if (existingRegistration) {
    throw new BadRequestException('You have already registered for this shift on this date')
  }

  // Kiểm tra conflict thời gian
  await checkShiftTimeConflict(employeeIdStr, shiftId, registrationDate)

  // Kiểm tra maxEmployees (nếu có)
  if (shift.maxEmployees) {
    const startOfDay = new Date(registrationDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(registrationDate)
    endOfDay.setHours(23, 59, 59, 999)

    const approvedCount = await ShiftRegistrationModel.countDocuments({
      shiftId: new mongoose.Types.ObjectId(shiftId),
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      status: 'approved'
    })

    if (approvedCount >= shift.maxEmployees) {
      throw new BadRequestException(`This shift has reached the maximum number of employees (${shift.maxEmployees})`)
    }
  }

  // Tạo registration với UTC date
  const newRegistration = new ShiftRegistrationModel({
    employeeId: new mongoose.Types.ObjectId(employeeIdStr),
    shiftId: new mongoose.Types.ObjectId(shiftId),
    date: registrationDate, // Dùng parsed UTC date
    status: 'pending',
    note
  })

  await newRegistration.save()

  // Send notification to managers of this branch
  // Find all managers in the same branch
  const managers = await EmployeeModel.find({
    branchId: shift.branchId,
    role: 'manager'
  }).lean()

  // Get employee info for notification message
  const employee = await EmployeeModel.findById(employeeIdStr).lean()
  const employeeName = employee?.name || 'An employee'
  const shiftTime = `${shift.startTime} - ${shift.endTime}`

  // Send notification to all managers (async, don't block response)
  if (managers.length > 0) {
    Promise.all(
      managers.map((manager) =>
        notifyNewShiftRegistration(String(manager._id), employeeName, new Date(date), shiftTime).catch((err) => {
          console.error(`Failed to send registration notification to manager ${manager._id}:`, err)
        })
      )
    ).catch((err) => {
      console.error('Failed to send manager notifications:', err)
    })
  }

  return newRegistration.toObject()
}

// Approve registration (Manager/Admin)
export const approveRegistration = async (
  id: string,
  data: UpdateRegistrationStatusSchemaType,
  requestUser: RequestUser
) => {
  const registration = await ShiftRegistrationModel.findById(id).populate('employeeId shiftId')
  if (!registration) {
    throw new NotFoundException('Registration not found')
  }

  // Manager chỉ approve registrations trong chi nhánh của mình
  if (requestUser.role === 'manager') {
    const employee = await EmployeeModel.findById(registration.employeeId)
    if (!employee || employee.branchId.toString() !== requestUser.branchId.toString()) {
      throw new ForbiddenException('You can only approve registrations in your branch')
    }
  }

  if (registration.status !== 'pending') {
    throw new BadRequestException(`Cannot approve registration with status: ${registration.status}`)
  }

  // Kiểm tra maxEmployees trước khi approve
  const shift = await ShiftModel.findById(registration.shiftId)
  if (shift && shift.maxEmployees) {
    const startOfDay = new Date(registration.date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(registration.date)
    endOfDay.setHours(23, 59, 59, 999)

    const approvedCount = await ShiftRegistrationModel.countDocuments({
      shiftId: registration.shiftId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      status: 'approved'
    })

    if (approvedCount >= shift.maxEmployees) {
      throw new BadRequestException(`This shift has reached the maximum number of employees (${shift.maxEmployees})`)
    }
  }

  registration.status = 'approved'
  if (data.note) {
    registration.note = data.note
  }
  await registration.save()

  // Send notification to employee
  const populatedReg = await registration.populate('shiftId')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shiftData: any = populatedReg.shiftId
  const shiftTime = `${shiftData.startTime} - ${shiftData.endTime}`

  // Async notification - don't block response
  notifyShiftApproved(registration.employeeId, registration.date, shiftTime).catch((err) => {
    console.error('Failed to send approval notification:', err)
  })

  return registration.toObject()
}

// Reject registration (Manager/Admin)
export const rejectRegistration = async (
  id: string,
  data: UpdateRegistrationStatusSchemaType,
  requestUser: RequestUser
) => {
  const registration = await ShiftRegistrationModel.findById(id)
  if (!registration) {
    throw new NotFoundException('Registration not found')
  }

  // Manager chỉ reject registrations trong chi nhánh của mình
  if (requestUser.role === 'manager') {
    const employee = await EmployeeModel.findById(registration.employeeId)
    if (!employee || employee.branchId.toString() !== requestUser.branchId.toString()) {
      throw new ForbiddenException('You can only reject registrations in your branch')
    }
  }

  if (registration.status !== 'pending') {
    throw new BadRequestException(`Cannot reject registration with status: ${registration.status}`)
  }

  registration.status = 'rejected'
  if (data.note) {
    registration.note = data.note
  }
  await registration.save()

  // Send notification to employee
  const populatedReg = await registration.populate('shiftId')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shiftData: any = populatedReg.shiftId
  const shiftTime = `${shiftData.startTime} - ${shiftData.endTime}`
  const reason = data.note || undefined

  // Async notification - don't block response
  notifyShiftRejected(registration.employeeId, registration.date, shiftTime, reason).catch((err) => {
    console.error('Failed to send rejection notification:', err)
  })

  return registration.toObject()
}

// Xóa registration (Employee xóa của mình nếu pending)
export const deleteRegistration = async (id: string, requestUser: RequestUser) => {
  const registration = await ShiftRegistrationModel.findById(id)
  if (!registration) {
    throw new NotFoundException('Registration not found')
  }

  // Employee chỉ xóa registration của mình và phải ở trạng thái pending
  if (requestUser.role === 'employee') {
    if (registration.employeeId.toString() !== String(requestUser._id)) {
      throw new ForbiddenException('You can only delete your own registrations')
    }
    if (registration.status !== 'pending') {
      throw new BadRequestException('You can only delete pending registrations')
    }
  }

  // Manager có thể xóa registrations trong chi nhánh của mình
  if (requestUser.role === 'manager') {
    const employee = await EmployeeModel.findById(registration.employeeId)
    if (!employee || employee.branchId.toString() !== requestUser.branchId.toString()) {
      throw new ForbiddenException('You can only delete registrations in your branch')
    }
  }

  await ShiftRegistrationModel.findByIdAndDelete(id)

  return {
    message: 'Registration deleted successfully'
  }
}
