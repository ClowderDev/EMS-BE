import { Router } from 'express'
import { exportAttendanceController, exportEmployeesController } from '~/controllers/report.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { adminOrManager } from '~/middleware/role.middleware'

const router = Router()

router.use(authMiddleware)

// Export attendance report (CSV or PDF)
router.get('/attendance/export', adminOrManager, exportAttendanceController)

// Export employees list (CSV)
router.get('/employees/export', adminOrManager, exportEmployeesController)

export default router
