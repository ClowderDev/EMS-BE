import express from 'express'
import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { authMiddleware } from '~/middleware/auth.middleware'
import { adminOrManager, authenticatedOnly } from '~/middleware/role.middleware'
import * as payrollController from '~/controllers/payroll.controller'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * @swagger
 * /payroll/calculate:
 *   post:
 *     tags: [Payroll]
 *     summary: Calculate and create payroll (Manager/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - month
 *               - year
 *               - baseSalary
 *             properties:
 *               employeeId:
 *                 type: string
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               year:
 *                 type: integer
 *               baseSalary:
 *                 type: number
 *               overtimeRate:
 *                 type: number
 *                 default: 1.5
 *               bonuses:
 *                 type: number
 *               otherDeductions:
 *                 type: number
 *     responses:
 *       201:
 *         description: Payroll calculated successfully
 */
router.post('/calculate', adminOrManager, asyncHandler(payrollController.calculatePayrollController))

/**
 * @swagger
 * /payroll:
 *   get:
 *     tags: [Payroll]
 *     summary: Get payrolls with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, approved, paid]
 *     responses:
 *       200:
 *         description: Payrolls retrieved successfully
 */
router.get('/', authenticatedOnly, asyncHandler(payrollController.getPayrollsController))

/**
 * @swagger
 * /payroll/{id}:
 *   get:
 *     tags: [Payroll]
 *     summary: Get payroll by ID
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
 *         description: Payroll retrieved successfully
 */
router.get('/:id', authenticatedOnly, asyncHandler(payrollController.getPayrollByIdController))

/**
 * @swagger
 * /payroll/{id}/status:
 *   patch:
 *     tags: [Payroll]
 *     summary: Update payroll status (Manager/Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, paid]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payroll status updated successfully
 */
router.patch('/:id/status', adminOrManager, asyncHandler(payrollController.updatePayrollStatusController))

/**
 * @swagger
 * /payroll/{id}/recalculate:
 *   post:
 *     tags: [Payroll]
 *     summary: Recalculate payroll (draft only)
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
 *         description: Payroll recalculated successfully
 */
router.post('/:id/recalculate', adminOrManager, asyncHandler(payrollController.recalculatePayrollController))

/**
 * @swagger
 * /payroll/{id}/pay:
 *   post:
 *     tags: [Payroll]
 *     summary: Process payment for approved payroll (Admin only)
 *     description: Mark approved payroll as paid. Only admins can process payments. Payroll must be in 'approved' status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll ID
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment processed successfully. Payroll has been marked as paid.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: paid
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *                     paidBy:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *       400:
 *         description: Can only pay approved payrolls or already paid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admins can process payments
 *       404:
 *         description: Payroll not found
 */
router.post('/:id/pay', adminOrManager, asyncHandler(payrollController.processPaymentController))

/**
 * @swagger
 * /payroll/{id}:
 *   delete:
 *     tags: [Payroll]
 *     summary: Delete payroll (draft only, Manager/Admin)
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
 *         description: Payroll deleted successfully
 */
router.delete('/:id', adminOrManager, asyncHandler(payrollController.deletePayrollController))

export default router
