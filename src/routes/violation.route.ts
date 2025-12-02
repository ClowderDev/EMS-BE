import express from 'express'
import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { authMiddleware } from '~/middleware/auth.middleware'
import { adminOrManager, authenticatedOnly, adminOnly } from '~/middleware/role.middleware'
import * as violationController from '~/controllers/violation.controller'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * @swagger
 * /violations:
 *   post:
 *     tags: [Violations]
 *     summary: Create new violation (Manager/Admin only)
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
 *               - violationType
 *               - description
 *               - penaltyAmount
 *             properties:
 *               employeeId:
 *                 type: string
 *               violationType:
 *                 type: string
 *                 enum: [late, absence, policy, safety, other]
 *               description:
 *                 type: string
 *               penaltyAmount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Violation created successfully
 */
router.post('/', adminOrManager, asyncHandler(violationController.createViolationController))

/**
 * @swagger
 * /violations:
 *   get:
 *     tags: [Violations]
 *     summary: Get violations with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: violationType
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, acknowledged, resolved]
 *     responses:
 *       200:
 *         description: Violations retrieved successfully
 */
router.get('/', authenticatedOnly, asyncHandler(violationController.getViolationsController))

/**
 * @swagger
 * /violations/{id}:
 *   get:
 *     tags: [Violations]
 *     summary: Get violation by ID
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
 *         description: Violation retrieved successfully
 */
router.get('/:id', authenticatedOnly, asyncHandler(violationController.getViolationByIdController))

/**
 * @swagger
 * /violations/{id}:
 *   patch:
 *     tags: [Violations]
 *     summary: Update violation (Manager/Admin only)
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
 *               description:
 *                 type: string
 *               penaltyAmount:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Violation updated successfully
 */
router.patch('/:id', adminOrManager, asyncHandler(violationController.updateViolationController))

/**
 * @swagger
 * /violations/{id}/acknowledge:
 *   post:
 *     tags: [Violations]
 *     summary: Acknowledge violation (Employee)
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
 *         description: Violation acknowledged successfully
 */
router.post('/:id/acknowledge', authenticatedOnly, asyncHandler(violationController.acknowledgeViolationController))

/**
 * @swagger
 * /violations/{id}:
 *   delete:
 *     tags: [Violations]
 *     summary: Delete violation (Admin only)
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
 *         description: Violation deleted successfully
 */
router.delete('/:id', adminOnly, asyncHandler(violationController.deleteViolationController))

export default router
