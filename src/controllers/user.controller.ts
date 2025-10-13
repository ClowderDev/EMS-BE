import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { Request, Response } from 'express'
import { HTTPSTATUS } from '~/config/http.config'
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword
} from '~/services/user.service'
import {
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordTokenSchema
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

// POST /api/v1/users/reset-password?token=xxx
export const resetPasswordController = asyncHandler(async (req: Request, res: Response) => {
  // Validate token từ query param
  const { token } = resetPasswordTokenSchema.parse(req.query)

  // Validate body (password)
  const { newPassword } = resetPasswordSchema.parse(req.body)

  const result = await resetPassword(token, newPassword)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: null
  })
})
