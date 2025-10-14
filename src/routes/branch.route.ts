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

router.get('/', authMiddleware, getBranchesController)
router.get('/:id', authMiddleware, getBranchByIdController)

// Admin only
router.post('/', authMiddleware, adminOnly, createBranchController)
router.put('/:id', authMiddleware, adminOnly, updateBranchController)
router.delete('/:id', authMiddleware, adminOnly, deleteBranchController)

export default router
