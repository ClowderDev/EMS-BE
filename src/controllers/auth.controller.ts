import { Request, Response } from 'express'
import { HTTPSTATUS } from '~/config/http.config'
import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import {
  loginService,
  refreshTokenService,
  registerService,
  verifyEmailService,
  resendVerificationEmailService,
  updateEmailService
} from '~/services/auth.service'
import { loginSchema, registerSchema, verifyEmailSchema, resendVerificationSchema } from '~/validation/auth.validator'
import { BadRequestException } from '~/utils/app-error'

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body)

  const result = await registerService(body)

  return res.status(HTTPSTATUS.CREATED).json({
    message: 'User registered successfully',
    data: result
  })
})

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body)

  const result = await loginService(body, res)

  //Trả về access token trong response body
  return res.status(HTTPSTATUS.OK).json({
    message: 'User logged in successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  })
})

export const refreshTokenController = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken

  if (!refreshToken) {
    throw new BadRequestException('Refresh token is required')
  }

  const result = await refreshTokenService(refreshToken, res)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Token refreshed successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  })
})

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')

  return res.status(HTTPSTATUS.OK).json({
    message: 'User logged out successfully'
  })
})

export const verifyEmailController = asyncHandler(async (req: Request, res: Response) => {
  const body = verifyEmailSchema.parse(req.body)

  const result = await verifyEmailService(body.email, body.code)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: {
      user: result.user
    }
  })
})

export const resendVerificationEmailController = asyncHandler(async (req: Request, res: Response) => {
  const body = resendVerificationSchema.parse(req.body)

  const result = await resendVerificationEmailService(body.email)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message
  })
})

export const updateEmailController = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email || !email.trim()) {
    throw new BadRequestException('Email is required')
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new BadRequestException('Invalid email format')
  }

  const result = await updateEmailService(req.user!.id, email)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: {
      user: result.user
    }
  })
})
