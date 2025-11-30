import express from 'express'
import authRoutes from './auth.route'
import userRoutes from './user.route'
import branchRoutes from './branch.route'
import employeeRoutes from './employee.route'
import shiftRoutes from './shift.route'
import shiftRegistrationRoutes from './shift-registration.route'
import attendanceRoutes from './attendance.route'
import notificationRoutes from './notification.route'
import reportRoutes from './report.route'
import messageRoutes from './message.route'
import violationRoutes from './violation.route'
import payrollRoutes from './payroll.route'
import salaryGoalRoutes from './salary-goal.route'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/branches', branchRoutes)
router.use('/employees', employeeRoutes)
router.use('/shifts', shiftRoutes)
router.use('/shift-registrations', shiftRegistrationRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/notifications', notificationRoutes)
router.use('/reports', reportRoutes)
router.use('/messages', messageRoutes)
router.use('/violations', violationRoutes)
router.use('/payroll', payrollRoutes)
router.use('/salary-goals', salaryGoalRoutes)

export default router
