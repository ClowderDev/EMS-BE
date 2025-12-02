import { Router } from 'express'
import {
  getRegistrationsController,
  createRegistrationController,
  approveRegistrationController,
  rejectRegistrationController,
  deleteRegistrationController
} from '~/controllers/shift-registration.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { adminOrManager, authenticatedOnly } from '~/middleware/role.middleware'

const router = Router()

router.use(authMiddleware)

/**
 * @swagger
 * /shift-registrations:
 *   get:
 *     tags: [Shift Registrations]
 *     summary: Get shift registrations with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
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
 *     responses:
 *       200:
 *         description: Registrations retrieved successfully
 */
router.get('/', authenticatedOnly, getRegistrationsController)

/**
 * @swagger
 * /shift-registrations:
 *   post:
 *     tags: [Shift Registrations]
 *     summary: Register for a shift
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shiftId
 *               - date
 *             properties:
 *               shiftId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-15"
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration created successfully
 */
router.post('/', authenticatedOnly, createRegistrationController)

/**
 * @swagger
 * /shift-registrations/{id}/approve:
 *   put:
 *     tags: [Shift Registrations]
 *     summary: Approve shift registration (Manager/Admin only)
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
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration approved successfully
 */
router.put('/:id/approve', adminOrManager, approveRegistrationController)

/**
 * @swagger
 * /shift-registrations/{id}/reject:
 *   put:
 *     tags: [Shift Registrations]
 *     summary: Reject shift registration (Manager/Admin only)
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
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration rejected successfully
 */
router.put('/:id/reject', adminOrManager, rejectRegistrationController)

/**
 * @swagger
 * /shift-registrations/{id}:
 *   delete:
 *     tags: [Shift Registrations]
 *     summary: Delete shift registration
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
 *         description: Registration deleted successfully
 */
router.delete('/:id', authenticatedOnly, deleteRegistrationController)

export default router
