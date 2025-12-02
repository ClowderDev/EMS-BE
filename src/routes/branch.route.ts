import { Router } from 'express'
import {
  getBranchesController,
  getBranchByIdController,
  createBranchController,
  updateBranchController,
  deleteBranchController
} from '~/controllers/branch.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { adminOnly } from '~/middleware/role.middleware'

const router = Router()

/**
 * @swagger
 * /branches:
 *   get:
 *     tags: [Branches]
 *     summary: Get all branches
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Branches retrieved successfully
 */
router.get('/', authMiddleware, getBranchesController)

/**
 * @swagger
 * /branches/{id}:
 *   get:
 *     tags: [Branches]
 *     summary: Get branch by ID
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
 *         description: Branch retrieved successfully
 */
router.get('/:id', authMiddleware, getBranchByIdController)

/**
 * @swagger
 * /branches:
 *   post:
 *     tags: [Branches]
 *     summary: Create new branch (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchName
 *               - address
 *             properties:
 *               branchName:
 *                 type: string
 *                 example: Head Office
 *               address:
 *                 type: string
 *                 example: 123 Main St, City
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               allowedRadius:
 *                 type: number
 *                 example: 500
 *     responses:
 *       201:
 *         description: Branch created successfully
 */
router.post('/', authMiddleware, adminOnly, createBranchController)

/**
 * @swagger
 * /branches/{id}:
 *   put:
 *     tags: [Branches]
 *     summary: Update branch (Admin only)
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
 *               branchName:
 *                 type: string
 *               address:
 *                 type: string
 *               location:
 *                 type: object
 *               allowedRadius:
 *                 type: number
 *     responses:
 *       200:
 *         description: Branch updated successfully
 */
router.put('/:id', authMiddleware, adminOnly, updateBranchController)

/**
 * @swagger
 * /branches/{id}:
 *   delete:
 *     tags: [Branches]
 *     summary: Delete branch (Admin only)
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
 *         description: Branch deleted successfully
 */
router.delete('/:id', authMiddleware, adminOnly, deleteBranchController)

export default router
