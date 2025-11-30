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

// Create or update goal for current/specified month
router.post('/', authenticatedOnly, createOrUpdateGoalController)

// Get current goal with progress and comparison
router.get('/current', authenticatedOnly, getCurrentGoalController)

// Get goal history
router.get('/history', authenticatedOnly, getGoalHistoryController)

// Update specific goal
router.put('/:id', authenticatedOnly, updateGoalController)

// Delete specific goal
router.delete('/:id', authenticatedOnly, deleteGoalController)

export default router
