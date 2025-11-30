import { z } from 'zod'

export const createGoalSchema = z.object({
  targetShifts: z.number().int().min(1, 'Target shifts must be at least 1').max(31, 'Target shifts cannot exceed 31'),
  month: z.number().int().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12').optional(),
  year: z.number().int().min(2020, 'Year must be at least 2020').max(2100, 'Year cannot exceed 2100').optional()
})

export const updateGoalSchema = z
  .object({
    targetShifts: z
      .number()
      .int()
      .min(1, 'Target shifts must be at least 1')
      .max(31, 'Target shifts cannot exceed 31')
      .optional(),
    status: z.enum(['active', 'completed', 'cancelled']).optional()
  })
  .refine((data) => data.targetShifts !== undefined || data.status !== undefined, {
    message: 'At least one field must be provided'
  })

export const goalIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid goal ID format')
})

export type CreateGoalSchemaType = z.infer<typeof createGoalSchema>
export type UpdateGoalSchemaType = z.infer<typeof updateGoalSchema>
export type GoalIdSchemaType = z.infer<typeof goalIdSchema>
