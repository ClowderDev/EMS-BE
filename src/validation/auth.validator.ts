import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  branchId: z.string().min(1, 'Branch ID is required'),
  role: z.enum(['employee', 'manager', 'admin'], {
    message: 'Role must be one of: employee, manager, admin'
  })
})

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

export type RegisterSchemaType = z.infer<typeof registerSchema>
export type LoginSchemaType = z.infer<typeof loginSchema>
export type RefreshTokenSchemaType = z.infer<typeof refreshTokenSchema>
