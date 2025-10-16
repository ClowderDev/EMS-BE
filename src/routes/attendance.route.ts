import { Router } from 'express'
import {
  checkInController,
  checkOutController,
  getAttendancesController,
  getAttendanceByIdController,
  getMonthlyReportController
} from '~/controllers/attendance.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { authenticatedOnly } from '~/middleware/role.middleware'

const router = Router()

router.use(authMiddleware)

router.post('/check-in', authenticatedOnly, checkInController)
router.post('/check-out', authenticatedOnly, checkOutController)
router.get('/', authenticatedOnly, getAttendancesController)
router.get('/report/monthly', authenticatedOnly, getMonthlyReportController)
router.get('/:id', authenticatedOnly, getAttendanceByIdController)

export default router
