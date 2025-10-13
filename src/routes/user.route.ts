import { Router } from 'express'
import {
  getUserProfileController,
  updateUserProfileController,
  changePasswordController,
  forgotPasswordController,
  resetPasswordController
} from '~/controllers/user.controller'
import { authMiddleware } from '~/middleware/auth.middleware'

const router = Router()

router.post('/forgot-password', forgotPasswordController)
router.post('/reset-password', resetPasswordController)

// Protected routes
router.use(authMiddleware)

router.get('/profile', getUserProfileController)
router.put('/profile', updateUserProfileController)
router.put('/change-password', changePasswordController)

export default router
