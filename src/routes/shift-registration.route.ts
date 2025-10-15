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

router.get('/', authenticatedOnly, getRegistrationsController)

// Employee có thể đăng ký ca
router.post('/', authenticatedOnly, createRegistrationController)

// Manager/Admin có thể approve/reject
router.put('/:id/approve', adminOrManager, approveRegistrationController)
router.put('/:id/reject', adminOrManager, rejectRegistrationController)

// Employee có thể xóa registration của mình (pending), Manager/Admin xóa trong branch
router.delete('/:id', authenticatedOnly, deleteRegistrationController)

export default router
