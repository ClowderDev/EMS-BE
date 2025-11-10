import mongoose from 'mongoose'
import AttendanceModel from '~/models/attendance.model'
import ShiftRegistrationModel from '~/models/shift_registration.model'
import ShiftModel from '~/models/shift.model'
import BranchModel from '~/models/branch.model'
import EmployeeModel from '~/models/employee.model'
import { BadRequestException, NotFoundException, ForbiddenException } from '~/utils/app-error'
import {
  CheckInSchemaType,
  CheckOutSchemaType,
  GetAttendancesQuerySchemaType,
  MonthlyReportSchemaType
} from '~/validation/attendance.validator'

type RequestUser = {
  _id: string
  role: 'admin' | 'manager' | 'employee'
  branchId: mongoose.Types.ObjectId
}

// Helper: Get current date in Vietnam timezone (GMT+7) as UTC date at midnight
const getTodayInVietnamTimezone = (): Date => {
  const now = new Date()

  // Convert current UTC time to Vietnam time (UTC+7)
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)

  // Get Vietnam date components
  const year = vietnamTime.getUTCFullYear()
  const month = vietnamTime.getUTCMonth()
  const date = vietnamTime.getUTCDate()

  // Return as UTC midnight for that Vietnam date
  return new Date(Date.UTC(year, month, date, 0, 0, 0, 0))
}

// Helper: Get start and end of day for a date (used for queries)
const getDayBounds = (date: Date): { startOfDay: Date; endOfDay: Date } => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return { startOfDay, endOfDay }
}

// Helper: Calculate distance between two GPS coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

// Check-in
export const checkIn = async (data: CheckInSchemaType, requestUser: RequestUser) => {
  const { registrationId, latitude, longitude, notes } = data

  const employeeIdStr = String(requestUser._id)

  // 1. Validate registration exists và approved
  const registration = await ShiftRegistrationModel.findById(registrationId).populate('shiftId').populate('employeeId')

  if (!registration) {
    throw new NotFoundException('Shift registration not found')
  }

  if (registration.status !== 'approved') {
    throw new BadRequestException('Only approved shift registrations can be used for check-in')
  }

  // 2. Validate registration thuộc employee này
  if (registration.employeeId._id.toString() !== employeeIdStr) {
    throw new ForbiddenException('You can only check-in for your own shift registrations')
  }

  // 3. Validate ngày hôm nay (Vietnam timezone) khớp với registration date
  const todayVN = getTodayInVietnamTimezone()

  // Parse registration date - it's already stored as UTC midnight for the VN date
  const regDate = new Date(registration.date)
  const regDateUTC = new Date(
    Date.UTC(regDate.getUTCFullYear(), regDate.getUTCMonth(), regDate.getUTCDate(), 0, 0, 0, 0)
  )

  if (todayVN.getTime() !== regDateUTC.getTime()) {
    throw new BadRequestException(
      `This shift registration is for ${regDateUTC.toISOString().split('T')[0]}, not today (${todayVN.toISOString().split('T')[0]})`
    )
  }

  // 4. Kiểm tra đã check-in chưa
  const { startOfDay, endOfDay } = getDayBounds(todayVN)

  const existingAttendance = await AttendanceModel.findOne({
    registrationId: new mongoose.Types.ObjectId(registrationId),
    date: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  })

  if (existingAttendance) {
    throw new BadRequestException('You have already checked in for this shift today')
  }

  // 5. GPS Validation - Get branch location
  const shift = await ShiftModel.findById(registration.shiftId)
  if (!shift) {
    throw new NotFoundException('Shift not found')
  }

  const branch = await BranchModel.findById(shift.branchId)
  if (!branch) {
    throw new NotFoundException('Branch not found')
  }

  // GPS validation (if branch has location configured)
  if (branch.location && branch.location.latitude && branch.location.longitude) {
    const distance = calculateDistance(latitude, longitude, branch.location.latitude, branch.location.longitude)
    const maxDistanceKm = (branch.location.radius || 500) / 1000 // Convert meters to km

    if (distance > maxDistanceKm) {
      throw new BadRequestException(
        `You must be within ${branch.location.radius || 500}m of the branch to check-in. Current distance: ${Math.round(distance * 1000)}m`
      )
    }
  }

  // 6. Validate thời gian check-in trong khoảng shift time (có thể cho phép sớm 30 phút)
  const now = new Date()

  // Convert current time to Vietnam timezone to compare with shift time
  const nowVietnam = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const currentHour = nowVietnam.getUTCHours()
  const currentMinute = nowVietnam.getUTCMinutes()

  const [shiftStartHour, shiftStartMin] = shift.startTime.split(':').map(Number)
  const [shiftEndHour, shiftEndMin] = shift.endTime.split(':').map(Number)

  // Convert time to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute
  const shiftStartInMinutes = shiftStartHour * 60 + shiftStartMin
  const shiftEndInMinutes = shiftEndHour * 60 + shiftEndMin

  // Calculate earliest check-in time (30 minutes before shift start)
  let earliestCheckInMinutes = shiftStartInMinutes - 30

  // Handle wrap-around for times before midnight (e.g., 23:30 = 1410 minutes, not -30)
  if (earliestCheckInMinutes < 0) {
    earliestCheckInMinutes = 1440 + earliestCheckInMinutes // 1440 minutes in a day
  }

  // Handle overnight shifts (e.g., 22:00 - 06:00)
  const isOvernightShift = shiftEndInMinutes < shiftStartInMinutes

  let canCheckIn = false

  if (isOvernightShift) {
    // For overnight shifts: can check-in from 30 mins before start until end time next day
    canCheckIn = currentTimeInMinutes >= earliestCheckInMinutes || currentTimeInMinutes <= shiftEndInMinutes
  } else {
    // For regular shifts that start near midnight (e.g., 00:00-08:00)
    if (earliestCheckInMinutes > shiftStartInMinutes) {
      // earliestCheckIn is previous day (e.g., 23:30 for 00:00 start)
      // Allow check-in if: time >= 23:30 (previous day) OR time <= 08:00 (current day)
      canCheckIn = currentTimeInMinutes >= earliestCheckInMinutes || currentTimeInMinutes <= shiftEndInMinutes
    } else {
      // Normal case: check-in window is within same day
      canCheckIn = currentTimeInMinutes >= earliestCheckInMinutes && currentTimeInMinutes <= shiftEndInMinutes
    }
  }

  if (!canCheckIn) {
    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60) % 24
      const m = mins % 60
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }

    throw new BadRequestException(
      `Check-in is only allowed from ${formatTime(earliestCheckInMinutes)} to ${shift.endTime} (Vietnam time). Current time: ${formatTime(currentTimeInMinutes)}`
    )
  }

  // 7. Create attendance record
  const attendance = new AttendanceModel({
    employeeId: new mongoose.Types.ObjectId(employeeIdStr),
    shiftId: registration.shiftId,
    registrationId: new mongoose.Types.ObjectId(registrationId),
    date: todayVN, // Use Vietnam timezone date
    checkInTime: now,
    checkInLocation: {
      latitude,
      longitude
    },
    status: 'checked-in',
    notes
  })

  await attendance.save()

  // Populate for response
  await attendance.populate([
    { path: 'employeeId', select: 'name email role' },
    { path: 'shiftId', select: 'shiftName startTime endTime' },
    { path: 'registrationId' }
  ])

  return attendance.toObject()
}

// Check-out
export const checkOut = async (data: CheckOutSchemaType, requestUser: RequestUser) => {
  const { attendanceId, latitude, longitude, notes } = data

  const employeeIdStr = String(requestUser._id)

  // 1. Find attendance record
  const attendance = await AttendanceModel.findById(attendanceId)

  if (!attendance) {
    throw new NotFoundException('Attendance record not found')
  }

  // 2. Validate attendance thuộc employee này
  if (attendance.employeeId.toString() !== employeeIdStr) {
    throw new ForbiddenException('You can only check-out your own attendance')
  }

  // 3. Validate đã check-in chưa
  if (!attendance.checkInTime) {
    throw new BadRequestException('You must check-in before checking out')
  }

  // 4. Validate chưa check-out
  if (attendance.checkOutTime) {
    throw new BadRequestException('You have already checked out')
  }

  // 5. GPS validation for check-out
  const shift = await ShiftModel.findById(attendance.shiftId)
  if (shift) {
    const branch = await BranchModel.findById(shift.branchId)
    if (branch && branch.location && branch.location.latitude && branch.location.longitude) {
      const distance = calculateDistance(latitude, longitude, branch.location.latitude, branch.location.longitude)
      const maxDistanceKm = (branch.location.radius || 500) / 1000

      if (distance > maxDistanceKm) {
        throw new BadRequestException(
          `You must be within ${branch.location.radius || 500}m of the branch to check-out. Current distance: ${Math.round(distance * 1000)}m`
        )
      }
    }
  }

  // 6. Update attendance
  const now = new Date()
  attendance.checkOutTime = now
  attendance.checkOutLocation = {
    latitude,
    longitude
  }
  attendance.status = 'checked-out'
  if (notes) {
    attendance.notes = notes
  }

  // Calculate work hours
  attendance.workHours = attendance.calculateWorkHours()

  await attendance.save()

  // Populate for response
  await attendance.populate([
    { path: 'employeeId', select: 'name email role' },
    { path: 'shiftId', select: 'shiftName startTime endTime' },
    { path: 'registrationId' }
  ])

  return attendance.toObject()
}

// Get attendances with filters
export const getAttendances = async (query: GetAttendancesQuerySchemaType, requestUser: RequestUser) => {
  const { page, limit, status, employeeId, shiftId, startDate, endDate, sortBy, order } = query

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {}

  // Employee chỉ xem attendance của mình
  if (requestUser.role === 'employee') {
    filter.employeeId = new mongoose.Types.ObjectId(String(requestUser._id))
  }

  // Manager chỉ xem attendance của nhân viên trong chi nhánh
  if (requestUser.role === 'manager') {
    const employeesInBranch = await EmployeeModel.find({ branchId: requestUser.branchId }).select('_id').lean()
    const employeeIds = employeesInBranch.map((emp) => emp._id)
    filter.employeeId = { $in: employeeIds }
  }

  // Filter theo status
  if (status) {
    filter.status = status
  }

  // Filter theo employeeId (Admin có thể filter)
  if (employeeId && requestUser.role === 'admin') {
    if (mongoose.Types.ObjectId.isValid(employeeId)) {
      filter.employeeId = new mongoose.Types.ObjectId(employeeId)
    } else {
      return {
        attendances: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      }
    }
  }

  // Filter theo shiftId
  if (shiftId) {
    if (mongoose.Types.ObjectId.isValid(shiftId)) {
      filter.shiftId = new mongoose.Types.ObjectId(shiftId)
    } else {
      return {
        attendances: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      }
    }
  }

  // Filter theo date range
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) {
      filter.date.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filter.date.$lte = end
    }
  }

  // Build sort
  const sort: Record<string, 1 | -1> = {}
  sort[sortBy] = order === 'asc' ? 1 : -1

  const skip = (page - 1) * limit

  const [attendances, total] = await Promise.all([
    AttendanceModel.find(filter)
      .populate('employeeId', 'name email role')
      .populate('shiftId', 'shiftName startTime endTime')
      .populate('registrationId')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    AttendanceModel.countDocuments(filter)
  ])

  return {
    attendances,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// Get attendance by ID
export const getAttendanceById = async (id: string, requestUser: RequestUser) => {
  const attendance = await AttendanceModel.findById(id)
    .populate('employeeId', 'name email role')
    .populate('shiftId', 'shiftName startTime endTime')
    .populate('registrationId')
    .lean()

  if (!attendance) {
    throw new NotFoundException('Attendance not found')
  }

  // Employee chỉ xem attendance của mình
  if (requestUser.role === 'employee') {
    if (attendance.employeeId._id.toString() !== String(requestUser._id)) {
      throw new ForbiddenException('You can only view your own attendance')
    }
  }

  // Manager chỉ xem attendance trong chi nhánh
  if (requestUser.role === 'manager') {
    const employee = await EmployeeModel.findById(attendance.employeeId._id)
    if (!employee || employee.branchId.toString() !== requestUser.branchId.toString()) {
      throw new ForbiddenException('You can only view attendance in your branch')
    }
  }

  return attendance
}

// Monthly report
export const getMonthlyReport = async (query: MonthlyReportSchemaType, requestUser: RequestUser) => {
  const { month, year, employeeId } = query

  // Build date range for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }

  // Employee chỉ xem report của mình
  if (requestUser.role === 'employee') {
    filter.employeeId = new mongoose.Types.ObjectId(String(requestUser._id))
  } else if (employeeId) {
    // Admin/Manager có thể xem report của employee cụ thể
    if (requestUser.role === 'manager') {
      // Validate employee trong branch
      const employee = await EmployeeModel.findById(employeeId)
      if (!employee || employee.branchId.toString() !== requestUser.branchId.toString()) {
        throw new ForbiddenException('You can only view reports for employees in your branch')
      }
    }
    filter.employeeId = new mongoose.Types.ObjectId(employeeId)
  } else if (requestUser.role === 'manager') {
    // Manager xem tất cả trong branch
    const employeesInBranch = await EmployeeModel.find({ branchId: requestUser.branchId }).select('_id').lean()
    const employeeIds = employeesInBranch.map((emp) => emp._id)
    filter.employeeId = { $in: employeeIds }
  }

  const attendances = await AttendanceModel.find(filter)
    .populate('employeeId', 'name email role')
    .populate('shiftId', 'shiftName startTime endTime')
    .sort({ date: 1 })
    .lean()

  // Calculate statistics
  const totalDays = attendances.length
  const checkedInDays = attendances.filter((a) => a.status === 'checked-in' || a.status === 'checked-out').length
  const checkedOutDays = attendances.filter((a) => a.status === 'checked-out').length
  const totalWorkHours = attendances.reduce((sum, a) => sum + (a.workHours || 0), 0)

  return {
    month,
    year,
    summary: {
      totalDays,
      checkedInDays,
      checkedOutDays,
      absentDays: totalDays - checkedInDays,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100
    },
    attendances
  }
}
