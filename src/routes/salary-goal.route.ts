import { Router } from 'express'
import {
  createOrUpdateGoalController,
  getCurrentGoalController,
  getGoalHistoryController,
  updateGoalController,
  deleteGoalController
} from '~/controllers/salary-goal.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { authenticatedOnly } from '~/middleware/role.middleware'

const router = Router()

router.use(authMiddleware)

/**
 * @swagger
 * /salary-goals:
 *   post:
 *     tags: [Salary Goals]
 *     summary: Create or update salary goal
 *     description: Create a new salary goal or update existing goal for current/specified month
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetShifts
 *             properties:
 *               targetShifts:
 *                 type: number
 *                 minimum: 1
 *                 example: 20
 *               month:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 12
 *               year:
 *                 type: number
 *                 minimum: 2020
 *                 example: 2024
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *       201:
 *         description: Goal created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticatedOnly, createOrUpdateGoalController)

/**
 * @swagger
 * /salary-goals/current:
 *   get:
 *     tags: [Salary Goals]
 *     summary: Get current month salary goal
 *     description: Get salary goal for current month with progress tracking and comparison to same day in previous month
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current goal retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     goal:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         employeeId:
 *                           type: string
 *                         targetShifts:
 *                           type: number
 *                         currentShifts:
 *                           type: number
 *                         currentEarnings:
 *                           type: number
 *                         month:
 *                           type: number
 *                         year:
 *                           type: number
 *                         status:
 *                           type: string
 *                           enum: [active, completed, failed]
 *                     progress:
 *                       type: object
 *                       properties:
 *                         percentage:
 *                           type: number
 *                         isAchieved:
 *                           type: boolean
 *                     comparison:
 *                       type: object
 *                       properties:
 *                         previousMonthEarnings:
 *                           type: number
 *                         difference:
 *                           type: number
 *                         percentageChange:
 *                           type: number
 *       404:
 *         description: No goal found for current month
 *       401:
 *         description: Unauthorized
 */
router.get('/current', authenticatedOnly, getCurrentGoalController)

/**
 * @swagger
 * /salary-goals/history:
 *   get:
 *     tags: [Salary Goals]
 *     summary: Get salary goal history
 *     description: Get all salary goals history for the authenticated employee, sorted by most recent
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Goal history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                       targetShifts:
 *                         type: number
 *                       currentShifts:
 *                         type: number
 *                       currentEarnings:
 *                         type: number
 *                       month:
 *                         type: number
 *                       year:
 *                         type: number
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/history', authenticatedOnly, getGoalHistoryController)

/**
 * @swagger
 * /salary-goals/{id}:
 *   put:
 *     tags: [Salary Goals]
 *     summary: Update salary goal
 *     description: Update an existing salary goal by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetShifts:
 *                 type: number
 *                 minimum: 1
 *                 example: 25
 *               status:
 *                 type: string
 *                 enum: [active, completed, failed]
 *                 example: active
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot update goal of another employee
 *       404:
 *         description: Goal not found
 */
router.put('/:id', authenticatedOnly, updateGoalController)

/**
 * @swagger
 * /salary-goals/{id}:
 *   delete:
 *     tags: [Salary Goals]
 *     summary: Delete salary goal
 *     description: Delete an existing salary goal by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       200:
 *         description: Goal deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot delete goal of another employee
 *       404:
 *         description: Goal not found
 */
router.delete('/:id', authenticatedOnly, deleteGoalController)

export default router
