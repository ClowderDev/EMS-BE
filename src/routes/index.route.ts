import express from 'express'
import authRoutes from './auth.route'
import userRoutes from './user.route'
import branchRoutes from './branch.route'
import employeeRoutes from './employee.route'
import shiftRoutes from './shift.route'
import shiftRegistrationRoutes from './shift-registration.route'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/branches', branchRoutes)
router.use('/employees', employeeRoutes)
router.use('/shifts', shiftRoutes)
router.use('/shift-registrations', shiftRegistrationRoutes)

export default router
