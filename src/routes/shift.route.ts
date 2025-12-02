import { Router } from 'express'
import {
  getShiftsController,
  getShiftByIdController,
  createShiftController,
  updateShiftController,
  deleteShiftController
} from '~/controllers/shift.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { adminOnly, adminOrManager } from '~/middleware/role.middleware'

const router = Router()

router.use(authMiddleware)

/**
 * @swagger
 * /shifts:
 *   get:
 *     tags: [Shifts]
 *     summary: Get all shifts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shifts retrieved successfully
 */
router.get('/', getShiftsController)

/**
 * @swagger
 * /shifts/{id}:
 *   get:
 *     tags: [Shifts]
 *     summary: Get shift by ID
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
 *         description: Shift retrieved successfully
 */
router.get('/:id', getShiftByIdController)

/**
 * @swagger
 * /shifts:
 *   post:
 *     tags: [Shifts]
 *     summary: Create new shift (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shiftName
 *               - startTime
 *               - endTime
 *               - branchId
 *             properties:
 *               shiftName:
 *                 type: string
 *                 example: Morning Shift
 *               startTime:
 *                 type: string
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 example: "16:00"
 *               branchId:
 *                 type: string
 *               maxEmployees:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Shift created successfully
 */
router.post('/', adminOrManager, createShiftController)

/**
 * @swagger
 * /shifts/{id}:
 *   put:
 *     tags: [Shifts]
 *     summary: Update shift (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftName:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               maxEmployees:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Shift updated successfully
 */
router.put('/:id', adminOrManager, updateShiftController)

/**
 * @swagger
 * /shifts/{id}:
 *   delete:
 *     tags: [Shifts]
 *     summary: Delete shift (Admin only)
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
 *         description: Shift deleted successfully
 */
router.delete('/:id', adminOnly, deleteShiftController)

export default router
