import express from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController
} from '../controllers/auth.controller'

const router = express.Router()

router.post('/register', registerController)
router.post('/login', loginController)
router.get('/refresh-token', refreshTokenController)
router.post('/logout', logoutController)

export default router
