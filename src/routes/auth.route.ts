import express from 'express'
import { loginController, refreshTokenController, registerController } from '../controllers/auth.controller'

const router = express.Router()

router.post('/register', registerController)
router.post('/login', loginController)
router.get('/refresh-token', refreshTokenController)

export default router
