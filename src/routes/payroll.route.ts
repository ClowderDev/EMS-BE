import express from 'express'
import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { authMiddleware } from '~/middleware/auth.middleware'
import { adminOrManager, authenticatedOnly } from '~/middleware/role.middleware'
import * as payrollController from '~/controllers/payroll.controller'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * @route   POST /api/v1/payroll/calculate
 * @desc    Calculate and create payroll for an employee
 * @access  Manager, Admin
 */
router.post('/calculate', adminOrManager, asyncHandler(payrollController.calculatePayrollController))

/**
 * @route   GET /api/v1/payroll
 * @desc    Get payrolls with filters (role-based access)
 * @access  Employee (own), Manager (branch), Admin (all)
 */
router.get('/', authenticatedOnly, asyncHandler(payrollController.getPayrollsController))

/**
 * @route   GET /api/v1/payroll/:id
 * @desc    Get single payroll by ID
 * @access  Employee (own), Manager (branch), Admin (all)
 */
router.get('/:id', authenticatedOnly, asyncHandler(payrollController.getPayrollByIdController))

/**
 * @route   PATCH /api/v1/payroll/:id/status
 * @desc    Update payroll status (approve/mark as paid)
 * @access  Manager, Admin
 */
router.patch('/:id/status', adminOrManager, asyncHandler(payrollController.updatePayrollStatusController))

/**
 * @route   POST /api/v1/payroll/:id/recalculate
 * @desc    Recalculate payroll (draft only)
 * @access  Manager, Admin
 */
router.post('/:id/recalculate', adminOrManager, asyncHandler(payrollController.recalculatePayrollController))

/**
 * @route   DELETE /api/v1/payroll/:id
 * @desc    Delete payroll (admin only, draft only)
 * @access  Admin
 */
router.delete('/:id', adminOrManager, asyncHandler(payrollController.deletePayrollController))

export default router
