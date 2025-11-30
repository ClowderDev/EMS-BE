import SalaryGoalModel from '~/models/salary-goal.model'
import EmployeeModel from '~/models/employee.model'
import AttendanceModel from '~/models/attendance.model'
import PayrollModel from '~/models/payroll.model'
import { BadRequestException, NotFoundException } from '~/utils/app-error'

interface CreateGoalInput {
  employeeId: string
  targetShifts: number
  month?: number
  year?: number
}

interface UpdateGoalInput {
  targetShifts?: number
  status?: 'active' | 'completed' | 'cancelled'
}

/**
 * Helper: Calculate earnings from attendance records using payroll logic
 */
const calculateEarnings = async (employeeId: string, attendances: Array<{ workHours?: number | null }>) => {
  if (attendances.length === 0) return 0

  // Get employee's base salary from most recent payroll or use default
  const recentPayroll = await PayrollModel.findOne({ employeeId }).sort({ year: -1, month: -1 }).lean()
  const baseSalary = recentPayroll?.baseSalary || 5000000 // Default 5M VND if no payroll exists

  // Calculate total work hours
  const totalWorkHours = attendances.reduce((sum, att) => sum + (att.workHours || 0), 0)

  // Calculate hourly rate
  const standardHours = 160
  const hourlyRate = baseSalary / standardHours

  // Calculate regular pay (up to 160 hours)
  const regularHours = Math.min(totalWorkHours, standardHours)
  const regularPay = regularHours * hourlyRate

  // Calculate overtime pay (hours beyond 160)
  const overtimeHours = Math.max(0, totalWorkHours - standardHours)
  const overtimeRate = 1.5
  const overtimePay = overtimeHours * hourlyRate * overtimeRate

  // Get bonuses if any (simplified - would need more complex logic in real app)
  const bonuses = 0

  // Total earnings
  const totalEarnings = regularPay + overtimePay + bonuses

  return Math.round(totalEarnings)
}

/**
 * Helper: Get days in a month
 */
const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate()
}

/**
 * Create or update salary goal for current/specified month
 */
export const createOrUpdateGoal = async (data: CreateGoalInput) => {
  const { employeeId, targetShifts } = data

  // Default to current month/year if not provided
  const now = new Date()
  const month = data.month || now.getMonth() + 1
  const year = data.year || now.getFullYear()

  // Validate month/year
  if (month < 1 || month > 12) {
    throw new BadRequestException('Month must be between 1 and 12')
  }

  // Check if employee exists
  const employee = await EmployeeModel.findById(employeeId)
  if (!employee) {
    throw new NotFoundException('Employee not found')
  }

  // Check if goal already exists for this period
  const existingGoal = await SalaryGoalModel.findOne({ employeeId, month, year })

  if (existingGoal) {
    // Update existing goal
    existingGoal.targetShifts = targetShifts
    existingGoal.status = 'active'
    await existingGoal.save()

    await existingGoal.populate('employeeId', 'name username email')
    return existingGoal
  }

  // Create new goal
  const goal = await SalaryGoalModel.create({
    employeeId,
    targetShifts,
    month,
    year,
    currentShifts: 0,
    currentEarnings: 0,
    status: 'active'
  })

  await goal.populate('employeeId', 'name username email')
  return goal
}

/**
 * Get current goal with progress and comparison to same day last month
 */
export const getCurrentGoal = async (employeeId: string) => {
  // Get current date info
  const now = new Date()
  const currentDay = now.getDate()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Get goal for current month
  const goal = await SalaryGoalModel.findOne({
    employeeId,
    month: currentMonth,
    year: currentYear
  }).lean()

  if (!goal) {
    throw new NotFoundException('No goal set for current month. Please create a goal first.')
  }

  // Calculate current period (from start of month to today)
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1)
  const endOfToday = new Date(currentYear, currentMonth - 1, currentDay, 23, 59, 59, 999)

  // Get attendance records for current period
  const currentAttendances = await AttendanceModel.find({
    employeeId,
    date: { $gte: startOfMonth, $lte: endOfToday },
    status: 'checked-out'
  }).lean()

  // Calculate current metrics
  const currentShifts = currentAttendances.length
  const currentEarnings = await calculateEarnings(employeeId, currentAttendances)
  const totalWorkHours = currentAttendances.reduce((sum, att) => sum + (att.workHours || 0), 0)

  // Calculate progress
  const progress = goal.targetShifts > 0 ? Math.round((currentShifts / goal.targetShifts) * 100) : 0

  // Calculate projected earnings
  const projectedEarnings = currentShifts > 0 ? Math.round((currentEarnings / currentShifts) * goal.targetShifts) : 0

  // Get previous month comparison (same day)
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear
  const daysInPreviousMonth = getDaysInMonth(previousMonth, previousYear)
  const sameDay = Math.min(currentDay, daysInPreviousMonth)

  const startOfPrevMonth = new Date(previousYear, previousMonth - 1, 1)
  const endOfSameDay = new Date(previousYear, previousMonth - 1, sameDay, 23, 59, 59, 999)

  // Get attendance records for same period last month
  const previousAttendances = await AttendanceModel.find({
    employeeId,
    date: { $gte: startOfPrevMonth, $lte: endOfSameDay },
    status: 'checked-out'
  }).lean()

  const previousShifts = previousAttendances.length
  const previousEarnings = await calculateEarnings(employeeId, previousAttendances)

  // Calculate changes
  const earningsChange = currentEarnings - previousEarnings
  const earningsChangePercent = previousEarnings > 0 ? Math.round((earningsChange / previousEarnings) * 100) : 0

  const shiftsChange = currentShifts - previousShifts

  // Calculate estimated hourly rate
  const estimatedHourlyRate = totalWorkHours > 0 ? Math.round(currentEarnings / totalWorkHours) : 0

  // Calculate shifts remaining and days left
  const shiftsRemaining = Math.max(0, goal.targetShifts - currentShifts)
  const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear)
  const daysLeftInMonth = daysInCurrentMonth - currentDay

  return {
    goal: {
      targetShifts: goal.targetShifts,
      currentShifts,
      progress,
      currentEarnings,
      projectedEarnings
    },
    comparison: {
      comparisonDate: `${sameDay}/${previousMonth}/${previousYear}`,
      currentDate: `${currentDay}/${currentMonth}/${currentYear}`,
      previousShifts,
      previousEarnings,
      currentShifts,
      currentEarnings,
      shiftsChange,
      earningsChange,
      earningsChangePercent,
      message:
        earningsChange > 0
          ? `Tăng ${earningsChange.toLocaleString()} so với tháng trước`
          : earningsChange < 0
            ? `Giảm ${Math.abs(earningsChange).toLocaleString()} so với tháng trước`
            : 'Không thay đổi so với tháng trước'
    },
    details: {
      totalWorkHours,
      estimatedHourlyRate,
      shiftsRemaining,
      daysLeftInMonth
    }
  }
}

/**
 * Get goal history
 */
export const getGoalHistory = async (employeeId: string, limit: number = 6) => {
  const goals = await SalaryGoalModel.find({ employeeId }).sort({ year: -1, month: -1 }).limit(limit).lean()

  // Enrich each goal with actual data
  const enrichedGoals = await Promise.all(
    goals.map(async (goal) => {
      // Get all attendance for that month
      const startOfMonth = new Date(goal.year, goal.month - 1, 1)
      const endOfMonth = new Date(goal.year, goal.month, 0, 23, 59, 59, 999)

      const attendances = await AttendanceModel.find({
        employeeId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'checked-out'
      }).lean()

      const actualShifts = attendances.length
      const earnings = await calculateEarnings(employeeId, attendances)
      const completed = actualShifts >= goal.targetShifts

      return {
        month: goal.month,
        year: goal.year,
        targetShifts: goal.targetShifts,
        actualShifts,
        earnings,
        completed,
        status: goal.status
      }
    })
  )

  return enrichedGoals
}

/**
 * Update goal
 */
export const updateGoal = async (goalId: string, employeeId: string, data: UpdateGoalInput) => {
  const goal = await SalaryGoalModel.findOne({ _id: goalId, employeeId })

  if (!goal) {
    throw new NotFoundException('Goal not found')
  }

  if (data.targetShifts !== undefined) {
    goal.targetShifts = data.targetShifts
  }

  if (data.status) {
    goal.status = data.status
  }

  await goal.save()
  await goal.populate('employeeId', 'name username email')

  return goal
}

/**
 * Delete goal
 */
export const deleteGoal = async (goalId: string, employeeId: string) => {
  const goal = await SalaryGoalModel.findOne({ _id: goalId, employeeId })

  if (!goal) {
    throw new NotFoundException('Goal not found')
  }

  await SalaryGoalModel.findByIdAndDelete(goalId)
}
