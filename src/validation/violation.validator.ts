import { z } from 'zod'

/**
 * Validator for creating a violation
 */
export const createViolationValidator = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    branchId: z.string().min(1, 'Branch ID is required'),
    shiftId: z.string().optional(),
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be at most 500 characters'),
    violationDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    penaltyAmount: z.number().min(0, 'Penalty amount must be a positive number'),
    notes: z.string().max(500, 'Notes must be at most 500 characters').optional()
  })
})

/**
 * Validator for updating a violation
 */
export const updateViolationValidator = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters')
      .optional(),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be at most 500 characters')
      .optional(),
    violationDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    penaltyAmount: z.number().min(0, 'Penalty amount must be a positive number').optional(),
    notes: z.string().max(500, 'Notes must be at most 500 characters').optional()
  })
})

/**
 * Validator for getting violations
 */
export const getViolationsValidator = z.object({
  query: z.object({
    employeeId: z.string().optional(),
    branchId: z.string().optional(),
    status: z.enum(['pending', 'acknowledged', 'resolved']).optional(),
    startDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    endDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional()
  })
})
