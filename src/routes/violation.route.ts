import express from 'express'
import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { authMiddleware } from '~/middleware/auth.middleware'
import { adminOrManager, authenticatedOnly, adminOnly } from '~/middleware/role.middleware'
import * as violationController from '~/controllers/violation.controller'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * @route   POST /api/v1/violations
 * @desc    Create a new violation (manager/admin only)
 * @access  Manager, Admin
 */
router.post('/', adminOrManager, asyncHandler(violationController.createViolationController))

/**
 * @route   GET /api/v1/violations
 * @desc    Get violations with filters (role-based access)
 * @access  Employee (own), Manager (branch), Admin (all)
 */
router.get('/', authenticatedOnly, asyncHandler(violationController.getViolationsController))

/**
 * @route   GET /api/v1/violations/:id
 * @desc    Get single violation by ID
 * @access  Employee (own), Manager (branch), Admin (all)
 */
router.get('/:id', authenticatedOnly, asyncHandler(violationController.getViolationByIdController))

/**
 * @route   PATCH /api/v1/violations/:id
 * @desc    Update violation (manager/admin only)
 * @access  Manager, Admin
 */
router.patch('/:id', adminOrManager, asyncHandler(violationController.updateViolationController))

/**
 * @route   POST /api/v1/violations/:id/acknowledge
 * @desc    Acknowledge violation (employee only)
 * @access  Employee (own violations)
 */
router.post('/:id/acknowledge', authenticatedOnly, asyncHandler(violationController.acknowledgeViolationController))

/**
 * @route   DELETE /api/v1/violations/:id
 * @desc    Delete violation (admin only)
 * @access  Admin
 */
router.delete('/:id', adminOnly, asyncHandler(violationController.deleteViolationController))

export default router
