import ViolationModel from '~/models/violation.model'
import EmployeeModel from '~/models/employee.model'
import NotificationModel from '~/models/notification.model'
import { BadRequestException, NotFoundException } from '~/utils/app-error'

interface CreateViolationInput {
  employeeId: string
  branchId: string
  shiftId?: string
  title: string
  description: string
  violationDate: Date
  penaltyAmount: number
  createdBy: string
  notes?: string
}

interface UpdateViolationInput {
  title?: string
  description?: string
  violationDate?: Date
  penaltyAmount?: number
  notes?: string
}

interface GetViolationsQuery {
  employeeId?: string
  branchId?: string
  status?: 'pending' | 'acknowledged' | 'resolved'
  startDate?: Date
  endDate?: Date
}

/**
 * Create a new violation
 */
export const createViolation = async (data: CreateViolationInput) => {
  // Verify employee exists
  const employee = await EmployeeModel.findById(data.employeeId)
  if (!employee) {
    throw new NotFoundException('Employee not found')
  }

  // Verify creator is manager or admin
  const creator = await EmployeeModel.findById(data.createdBy)
  if (!creator || !['manager', 'admin'].includes(creator.role)) {
    throw new BadRequestException('Only managers and admins can create violations')
  }

  // Create violation
  const violation = await ViolationModel.create({
    employeeId: data.employeeId,
    branchId: data.branchId,
    shiftId: data.shiftId,
    title: data.title,
    description: data.description,
    violationDate: data.violationDate,
    penaltyAmount: data.penaltyAmount,
    createdBy: data.createdBy,
    notes: data.notes,
    status: 'pending'
  })

  // Populate references
  await violation.populate([
    { path: 'employeeId', select: 'name email role' },
    { path: 'createdBy', select: 'name role' },
    { path: 'shiftId', select: 'shiftName startTime endTime' }
  ])

  // Send notification to employee
  await NotificationModel.create({
    employeeId: data.employeeId,
    title: 'Violation Recorded',
    message: `You have received a violation: ${data.title}. Penalty: $${data.penaltyAmount}. Please review the details.`,
    date: new Date(),
    status: 'unread'
  })

  return violation
}

/**
 * Get violations with filters
 */
export const getViolations = async (query: GetViolationsQuery, userId: string, userRole: string) => {
  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {}

  // Role-based access control
  if (userRole === 'employee') {
    // Employees can only see their own violations
    filter.employeeId = userId
  } else if (userRole === 'manager') {
    // Managers can see violations in their branch
    const manager = await EmployeeModel.findById(userId)
    if (manager?.branchId) {
      filter.branchId = manager.branchId
    }
  }
  // Admins can see all violations

  // Apply query filters
  if (query.employeeId) {
    filter.employeeId = query.employeeId
  }

  if (query.branchId) {
    filter.branchId = query.branchId
  }

  if (query.status) {
    filter.status = query.status
  }

  if (query.startDate || query.endDate) {
    filter.violationDate = {}
    if (query.startDate) {
      filter.violationDate.$gte = query.startDate
    }
    if (query.endDate) {
      filter.violationDate.$lte = query.endDate
    }
  }

  const violations = await ViolationModel.find(filter)
    .populate('employeeId', 'name email role')
    .populate('createdBy', 'name role')
    .populate('shiftId', 'shiftName startTime endTime')
    .populate('branchId', 'branchName')
    .sort({ violationDate: -1 })
    .lean()

  return violations
}

/**
 * Get violation by ID
 */
export const getViolationById = async (violationId: string, userId: string, userRole: string) => {
  const violation = await ViolationModel.findById(violationId)
    .populate('employeeId', 'name email role')
    .populate('createdBy', 'name role')
    .populate('shiftId', 'shiftName startTime endTime')
    .populate('branchId', 'branchName')
    .lean()

  if (!violation) {
    throw new NotFoundException('Violation not found')
  }

  // Access control
  if (userRole === 'employee' && violation.employeeId._id.toString() !== userId) {
    throw new BadRequestException('You can only view your own violations')
  }

  if (userRole === 'manager') {
    const manager = await EmployeeModel.findById(userId)
    if (manager?.branchId?.toString() !== violation.branchId._id.toString()) {
      throw new BadRequestException('You can only view violations in your branch')
    }
  }

  return violation
}

/**
 * Update violation (manager/admin only)
 */
export const updateViolation = async (violationId: string, data: UpdateViolationInput, userId: string) => {
  const violation = await ViolationModel.findById(violationId)

  if (!violation) {
    throw new NotFoundException('Violation not found')
  }

  // Verify updater is manager or admin
  const updater = await EmployeeModel.findById(userId)
  if (!updater || !['manager', 'admin'].includes(updater.role)) {
    throw new BadRequestException('Only managers and admins can update violations')
  }

  // Update fields
  if (data.title) violation.title = data.title
  if (data.description) violation.description = data.description
  if (data.violationDate) violation.violationDate = data.violationDate
  if (data.penaltyAmount !== undefined) violation.penaltyAmount = data.penaltyAmount
  if (data.notes) violation.notes = data.notes

  await violation.save()

  await violation.populate([
    { path: 'employeeId', select: 'name email role' },
    { path: 'createdBy', select: 'name role' },
    { path: 'shiftId', select: 'shiftName startTime endTime' }
  ])

  return violation
}

/**
 * Acknowledge violation (employee)
 */
export const acknowledgeViolation = async (violationId: string, userId: string) => {
  const violation = await ViolationModel.findById(violationId)

  if (!violation) {
    throw new NotFoundException('Violation not found')
  }

  // Verify user is the employee who received the violation
  if (violation.employeeId.toString() !== userId) {
    throw new BadRequestException('You can only acknowledge your own violations')
  }

  if (violation.status !== 'pending') {
    throw new BadRequestException('Violation has already been acknowledged')
  }

  violation.status = 'acknowledged'
  violation.acknowledgedAt = new Date()

  await violation.save()

  await violation.populate([
    { path: 'employeeId', select: 'name email role' },
    { path: 'createdBy', select: 'name role' },
    { path: 'shiftId', select: 'shiftName startTime endTime' }
  ])

  return violation
}

/**
 * Delete violation (admin only)
 */
export const deleteViolation = async (violationId: string, userRole: string) => {
  const violation = await ViolationModel.findById(violationId)

  if (!violation) {
    throw new NotFoundException('Violation not found')
  }

  // Verify user is admin
  if (userRole !== 'admin') {
    throw new BadRequestException('Only admins can delete violations')
  }

  await ViolationModel.findByIdAndDelete(violationId)
}

/**
 * Get total violation penalties for employee in a period (used by payroll)
 */
export const getViolationPenaltiesForPeriod = async (
  employeeId: string,
  month: number,
  year: number
): Promise<number> => {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const violations = await ViolationModel.find({
    employeeId,
    violationDate: { $gte: startDate, $lte: endDate }
  }).lean()

  const totalPenalty = violations.reduce((sum, violation) => sum + violation.penaltyAmount, 0)

  return totalPenalty
}
