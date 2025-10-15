import { z } from 'zod'

export const createShiftRegistrationSchema = z.object({
  shiftId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid shift ID format'),
  date: z.string().refine(
    (val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    },
    { message: 'Invalid date format. Use ISO 8601 (e.g., 2025-10-15)' }
  ),
  note: z.string().max(500, 'Note is too long').optional()
})

export const updateRegistrationStatusSchema = z.object({
  note: z.string().max(500, 'Note is too long').optional()
})

export const registrationIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid registration ID format')
})

export const getRegistrationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  shiftId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid shift ID format')
    .optional(),
  employeeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID format')
    .optional(),
  date: z.string().optional(),
  sortBy: z.enum(['date', 'status', 'createdAt', 'updatedAt']).optional().default('date'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

export type RegistrationIdSchemaType = z.infer<typeof registrationIdSchema>
export type GetRegistrationsQuerySchemaType = z.infer<typeof getRegistrationsQuerySchema>
export type UpdateRegistrationStatusSchemaType = z.infer<typeof updateRegistrationStatusSchema>
export type CreateShiftRegistrationSchemaType = z.infer<typeof createShiftRegistrationSchema>
