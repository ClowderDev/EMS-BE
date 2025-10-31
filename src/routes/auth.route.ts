import express from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  verifyEmailController,
  resendVerificationEmailController,
  updateEmailController
} from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = express.Router()

router.post('/register', registerController)
router.post('/login', loginController)
router.get('/refresh-token', refreshTokenController)
router.post('/logout', logoutController)
router.post('/verify-email', verifyEmailController)
router.post('/resend-verification', resendVerificationEmailController)
router.put('/update-email', authMiddleware, updateEmailController)

export default router
