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

/**
 * @swagger
 * /attendance/check-in:
 *   post:
 *     tags: [Attendance]
 *     summary: Check in to a registered shift
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationId
 *             properties:
 *               registrationId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 21.028
 *                   longitude:
 *                     type: number
 *                     example: 105.804
 *     responses:
 *       200:
 *         description: Check-in successful
 *       400:
 *         description: Invalid request or check-in conditions not met
 */
router.post('/check-in', authenticatedOnly, checkInController)

/**
 * @swagger
 * /attendance/check-out:
 *   post:
 *     tags: [Attendance]
 *     summary: Check out from current shift
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendanceId
 *             properties:
 *               attendanceId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *     responses:
 *       200:
 *         description: Check-out successful
 */
router.post('/check-out', authenticatedOnly, checkOutController)

/**
 * @swagger
 * /attendance:
 *   get:
 *     tags: [Attendance]
 *     summary: Get attendance records with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [checked-in, checked-out, absent]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 */
router.get('/', authenticatedOnly, getAttendancesController)

/**
 * @swagger
 * /attendance/report/monthly:
 *   get:
 *     tags: [Attendance]
 *     summary: Get monthly attendance report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Monthly report retrieved successfully
 */
router.get('/report/monthly', authenticatedOnly, getMonthlyReportController)

/**
 * @swagger
 * /attendance/{id}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get attendance record by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance record retrieved successfully
 *       404:
 *         description: Attendance not found
 */
router.get('/:id', authenticatedOnly, getAttendanceByIdController)

export default router
