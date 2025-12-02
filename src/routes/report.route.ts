import { Router } from 'express'
import { exportAttendanceController, exportEmployeesController } from '~/controllers/report.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { adminOrManager } from '~/middleware/role.middleware'

const router = Router()

router.use(authMiddleware)

/**
 * @swagger
 * /reports/attendance/export:
 *   get:
 *     tags: [Reports]
 *     summary: Export attendance report (Manager/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *           default: csv
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/attendance/export', adminOrManager, exportAttendanceController)

/**
 * @swagger
 * /reports/employees/export:
 *   get:
 *     tags: [Reports]
 *     summary: Export employees list (Manager/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [employee, manager, admin]
 *     responses:
 *       200:
 *         description: Employees exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/employees/export', adminOrManager, exportEmployeesController)

export default router
