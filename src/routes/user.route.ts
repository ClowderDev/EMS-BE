import { Router } from 'express'
import {
  getUserProfileController,
  updateUserProfileController,
  changePasswordController,
  forgotPasswordController,
  verifyResetPasswordOTPController,
  resetPasswordController
} from '~/controllers/user.controller'
import { authMiddleware } from '~/middleware/auth.middleware'

const router = Router()

// Public routes - Password reset flow
router.post('/forgot-password', forgotPasswordController) // Step 1: Request OTP
router.post('/verify-reset-otp', verifyResetPasswordOTPController) // Step 2: Verify OTP (optional)
router.post('/reset-password', resetPasswordController) // Step 3: Reset password with OTP

// Protected routes
router.use(authMiddleware)

router.get('/profile', getUserProfileController)
router.put('/profile', updateUserProfileController)
router.put('/change-password', changePasswordController)

export default router
