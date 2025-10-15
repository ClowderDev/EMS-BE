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

router.get('/', getShiftsController)
router.get('/:id', getShiftByIdController)

// Admin và Manager có thể tạo và sửa shifts
router.post('/', adminOrManager, createShiftController)
router.put('/:id', adminOrManager, updateShiftController)

// Chỉ Admin mới có thể xóa shift
router.delete('/:id', adminOnly, deleteShiftController)

export default router
