import PayrollModel from '~/models/payroll.model'
import EmployeeModel from '~/models/employee.model'
import AttendanceModel from '~/models/attendance.model'
import { getViolationPenaltiesForPeriod } from './violation.service'
import { BadRequestException, NotFoundException } from '~/utils/app-error'

interface CalculatePayrollInput {
  employeeId: string
  month: number
  year: number
  baseSalary: number
  overtimeRate?: number
  bonuses?: number
  otherDeductions?: number
}

interface UpdatePayrollStatusInput {
  status: 'pending' | 'approved' | 'paid'
  notes?: string
}

interface GetPayrollsQuery {
  employeeId?: string
  branchId?: string
  month?: number
  year?: number
  status?: 'draft' | 'pending' | 'approved' | 'paid'
}

/**
 * Calculate and create payroll for an employee
 */
export const calculatePayroll = async (data: CalculatePayrollInput) => {
  const { employeeId, month, year, baseSalary, overtimeRate = 1.5, bonuses = 0, otherDeductions = 0 } = data

  // Validate month
  if (month < 1 || month > 12) {
    throw new BadRequestException('Month must be between 1 and 12')
  }

  // Check if employee exists
  const employee = await EmployeeModel.findById(employeeId).populate('branchId')
  if (!employee) {
    throw new NotFoundException('Employee not found')
  }

  // Check if payroll already exists for this period
  const existingPayroll = await PayrollModel.findOne({ employeeId, month, year })
  if (existingPayroll) {
    throw new BadRequestException('Payroll already exists for this period')
  }

  // Get attendance records for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const attendances = await AttendanceModel.find({
    employeeId,
    date: { $gte: startDate, $lte: endDate },
    status: { $in: ['checked-in', 'checked-out'] }
  }).lean()

  // Calculate work hours
  const totalWorkHours = attendances.reduce((sum, att) => sum + (att.workHours || 0), 0)

  // Calculate overtime (hours beyond 160 hours/month standard)
  const standardHours = 160
  const overtimeHours = Math.max(0, totalWorkHours - standardHours)

  // Calculate hourly rate from base salary
  const hourlyRate = baseSalary / standardHours

  // Calculate overtime pay
  const overtimePay = overtimeHours * hourlyRate * overtimeRate

  // Calculate gross salary
  const grossSalary = baseSalary + overtimePay + bonuses

  // Get violation penalties for this period
  const violationPenalties = await getViolationPenaltiesForPeriod(employeeId, month, year)

  // Calculate late deductions (example: $10 per late check-in)
  const lateCheckIns = attendances.filter((att) => {
    if (!att.checkInTime || !att.shiftId) return false
    // Logic to check if checked in late (would need shift data)
    return false // Simplified for now
  })
  const lateDeductions = lateCheckIns.length * 10

  // Calculate absence deductions
  const expectedWorkDays = 22 // Average work days per month
  const actualWorkDays = attendances.filter((att) => att.status === 'checked-out').length
  const absences = Math.max(0, expectedWorkDays - actualWorkDays)
  const absenceDeductions = absences * (hourlyRate * 8) // Deduct 8 hours per absent day

  // Total deductions
  const totalDeductions = violationPenalties + lateDeductions + absenceDeductions + otherDeductions

  // Calculate net salary
  const netSalary = Math.max(0, grossSalary - totalDeductions)

  // Create payroll record
  const payroll = await PayrollModel.create({
    employeeId,
    branchId: employee.branchId,
    month,
    year,
    baseSalary,
    totalWorkHours,
    overtimeHours,
    overtimeRate,
    overtimePay,
    bonuses,
    deductions: {
      violations: violationPenalties,
      lateDeductions,
      absences: absenceDeductions,
      other: otherDeductions
    },
    grossSalary,
    netSalary,
    status: 'draft'
  })

  await payroll.populate([
    { path: 'employeeId', select: 'name email role' },
    { path: 'branchId', select: 'branchName address' }
  ])

  return payroll
}

/**
 * Get payrolls with filters
 */
export const getPayrolls = async (query: GetPayrollsQuery, userId: string, userRole: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {}

  // Role-based access control
  if (userRole === 'employee') {
    // Employees can only see their own payroll
    filter.employeeId = userId
  } else if (userRole === 'manager') {
    // Managers can see payrolls in their branch
    const manager = await EmployeeModel.findById(userId)
    if (manager?.branchId) {
      filter.branchId = manager.branchId
    }
  }
  // Admins can see all payrolls

  // Apply query filters
  if (query.employeeId) {
    filter.employeeId = query.employeeId
  }

  if (query.branchId) {
    filter.branchId = query.branchId
  }

  if (query.month) {
    filter.month = query.month
  }

  if (query.year) {
    filter.year = query.year
  }

  if (query.status) {
    filter.status = query.status
  }

  const payrolls = await PayrollModel.find(filter)
    .populate('employeeId', 'name email role')
    .populate('branchId', 'branchName')
    .populate('paidBy', 'name role')
    .sort({ year: -1, month: -1 })
    .lean()

  return payrolls
}

/**
 * Get payroll by ID
 */
export const getPayrollById = async (payrollId: string, userId: string, userRole: string) => {
  const payroll = await PayrollModel.findById(payrollId)
    .populate('employeeId', 'name email role')
    .populate('branchId', 'branchName')
    .populate('paidBy', 'name role')
    .lean()

  if (!payroll) {
    throw new NotFoundException('Payroll not found')
  }

  // Access control
  if (userRole === 'employee' && payroll.employeeId._id.toString() !== userId) {
    throw new BadRequestException('You can only view your own payroll')
  }

  if (userRole === 'manager') {
    const manager = await EmployeeModel.findById(userId)
    if (manager?.branchId?.toString() !== payroll.branchId._id.toString()) {
      throw new BadRequestException('You can only view payrolls in your branch')
    }
  }

  return payroll
}

/**
 * Update payroll status (manager/admin only)
 */
export const updatePayrollStatus = async (
  payrollId: string,
  data: UpdatePayrollStatusInput,
  userId: string,
  userRole: string
) => {
  const payroll = await PayrollModel.findById(payrollId)

  if (!payroll) {
    throw new NotFoundException('Payroll not found')
  }

  // Verify user is manager or admin
  if (!['manager', 'admin'].includes(userRole)) {
    throw new BadRequestException('Only managers and admins can update payroll status')
  }

  // Update status
  payroll.status = data.status

  if (data.notes) {
    payroll.notes = data.notes
  }

  // If marking as paid, record who paid and when
  if (data.status === 'paid' && !payroll.paidAt) {
    payroll.paidAt = new Date()
    payroll.paidBy = userId as unknown as typeof payroll.paidBy
  }

  await payroll.save()

  await payroll.populate([
    { path: 'employeeId', select: 'name email role' },
    { path: 'branchId', select: 'branchName' },
    { path: 'paidBy', select: 'name role' }
  ])

  return payroll
}

/**
 * Delete payroll (admin only, only if draft)
 */
export const deletePayroll = async (payrollId: string, userId: string, userRole: string) => {
  if (userRole !== 'admin') {
    throw new BadRequestException('Only admins can delete payroll')
  }

  const payroll = await PayrollModel.findById(payrollId)

  if (!payroll) {
    throw new NotFoundException('Payroll not found')
  }

  if (payroll.status !== 'draft') {
    throw new BadRequestException('Can only delete draft payrolls')
  }

  await PayrollModel.findByIdAndDelete(payrollId)
}

/**
 * Recalculate payroll (admin/manager only, only if draft)
 */
export const recalculatePayroll = async (payrollId: string, userId: string, userRole: string) => {
  if (!['manager', 'admin'].includes(userRole)) {
    throw new BadRequestException('Only managers and admins can recalculate payroll')
  }

  const payroll = await PayrollModel.findById(payrollId).populate('employeeId')

  if (!payroll) {
    throw new NotFoundException('Payroll not found')
  }

  if (payroll.status !== 'draft') {
    throw new BadRequestException('Can only recalculate draft payrolls')
  }

  // Delete old payroll
  await PayrollModel.findByIdAndDelete(payrollId)

  // Create new calculation
  const newPayroll = await calculatePayroll({
    employeeId: payroll.employeeId._id.toString(),
    month: payroll.month,
    year: payroll.year,
    baseSalary: payroll.baseSalary,
    overtimeRate: payroll.overtimeRate,
    bonuses: payroll.bonuses
  })

  return newPayroll
}

/**
 * Process payment for approved payroll (admin only)
 */
export const processPayment = async (payrollId: string, userId: string, userRole: string) => {
  // Only admins can process payments
  if (userRole !== 'admin') {
    throw new BadRequestException('Only admins can process payments')
  }

  const payroll = await PayrollModel.findById(payrollId)

  if (!payroll) {
    throw new NotFoundException('Payroll not found')
  }

  // Can only pay approved payrolls
  if (payroll.status !== 'approved') {
    throw new BadRequestException('Can only pay approved payrolls. Current status: ' + payroll.status)
  }

  // Check if already paid
  if (payroll.paidAt) {
    throw new BadRequestException('This payroll has already been paid')
  }

  // Simulate payment processing (in real system, would integrate with payment gateway)
  // Here we just mark as paid
  payroll.status = 'paid'
  payroll.paidAt = new Date()
  payroll.paidBy = userId as unknown as typeof payroll.paidBy

  await payroll.save()

  await payroll.populate([
    { path: 'employeeId', select: 'name email role phone' },
    { path: 'branchId', select: 'branchName' },
    { path: 'paidBy', select: 'name role' }
  ])

  return payroll
}
