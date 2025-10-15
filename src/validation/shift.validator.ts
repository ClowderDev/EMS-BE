import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const createShiftSchema = z
  .object({
    shiftName: z.string().min(3, 'Shift name must be at least 3 characters').max(100, 'Shift name is too long'),
    startTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:mm (e.g., 08:00)'),
    endTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:mm (e.g., 17:00)'),
    branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID format'),
    maxEmployees: z.number().int().min(1, 'Max employees must be at least 1').optional(),
    description: z.string().max(500, 'Description is too long').optional()
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.startTime.split(':').map(Number)
      const [endHour, endMin] = data.endTime.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      return startMinutes < endMinutes
    },
    {
      message: 'Start time must be before end time',
      path: ['endTime']
    }
  )

export type CreateShiftSchemaType = z.infer<typeof createShiftSchema>

export const updateShiftSchema = z
  .object({
    shiftName: z
      .string()
      .min(3, 'Shift name must be at least 3 characters')
      .max(100, 'Shift name is too long')
      .optional(),
    startTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:mm (e.g., 08:00)').optional(),
    endTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:mm (e.g., 17:00)').optional(),
    branchId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID format')
      .optional(),
    maxEmployees: z.number().int().min(1, 'Max employees must be at least 1').optional(),
    description: z.string().max(500, 'Description is too long').optional()
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const [startHour, startMin] = data.startTime.split(':').map(Number)
        const [endHour, endMin] = data.endTime.split(':').map(Number)
        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin
        return startMinutes < endMinutes
      }
      return true
    },
    {
      message: 'Start time must be before end time',
      path: ['endTime']
    }
  )

export type UpdateShiftSchemaType = z.infer<typeof updateShiftSchema>

export const shiftIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid shift ID format')
})

export type ShiftIdSchemaType = z.infer<typeof shiftIdSchema>

export const getShiftsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  branchId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID format - must be a valid MongoDB ObjectId')
    .optional(),
  sortBy: z.enum(['shiftName', 'startTime', 'endTime', 'createdAt', 'updatedAt']).optional().default('startTime'),
  order: z.enum(['asc', 'desc']).optional().default('asc')
})

export type GetShiftsQuerySchemaType = z.infer<typeof getShiftsQuerySchema>
