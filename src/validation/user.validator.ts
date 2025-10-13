import { z } from 'zod'

// Schema cho update profile
export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  email: z.string().email('Invalid email address').optional()
})

export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>

// Schema cho change password
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from old password',
    path: ['newPassword']
  })

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>

// Schema cho forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>

// Schema cho reset password (body only - token từ query param)
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>

// Schema cho reset password token (query param)
export const resetPasswordTokenSchema = z.object({
  token: z.string().min(1, 'Reset token is required')
})

export type ResetPasswordTokenSchemaType = z.infer<typeof resetPasswordTokenSchema>
