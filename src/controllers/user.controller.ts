import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { Request, Response } from 'express'
import { HTTPSTATUS } from '~/config/http.config'
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  verifyResetPasswordOTP,
  resetPassword
} from '~/services/user.service'
import {
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyResetPasswordOTPSchema,
  resetPasswordSchema
} from '~/validation/user.validator'

export const getUserProfileController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString()

  const result = await getUserProfile(userId)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get user profile successfully',
    data: result
  })
})

export const updateUserProfileController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString()

  const validatedData = updateProfileSchema.parse(req.body)

  const result = await updateUserProfile(userId, validatedData)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Profile updated successfully',
    data: result
  })
})

export const changePasswordController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString()

  const validatedData = changePasswordSchema.parse(req.body)

  const result = await changePassword(userId, validatedData)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: null
  })
})

export const forgotPasswordController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = forgotPasswordSchema.parse(req.body)

  const result = await forgotPassword(validatedData)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: null
  })
})

export const verifyResetPasswordOTPController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = verifyResetPasswordOTPSchema.parse(req.body)

  const result = await verifyResetPasswordOTP(validatedData)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: null
  })
})

export const resetPasswordController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = resetPasswordSchema.parse(req.body)

  const result = await resetPassword(validatedData)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: null
  })
})
