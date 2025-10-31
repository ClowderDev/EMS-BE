import { z } from 'zod'

/**
 * Validator for calculating/creating payroll
 */
export const calculatePayrollValidator = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    month: z.number().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
    year: z.number().min(2020, 'Year must be 2020 or later').max(2100, 'Year must be 2100 or earlier'),
    baseSalary: z.number().min(0, 'Base salary must be a positive number'),
    overtimeRate: z.number().min(1, 'Overtime rate must be at least 1.0').optional(),
    bonuses: z.number().min(0, 'Bonuses must be a positive number').optional(),
    otherDeductions: z.number().min(0, 'Other deductions must be a positive number').optional()
  })
})

/**
 * Validator for updating payroll status
 */
export const updatePayrollStatusValidator = z.object({
  body: z.object({
    status: z.enum(['draft', 'pending', 'approved', 'paid']),
    notes: z.string().max(500, 'Notes must be at most 500 characters').optional()
  })
})

/**
 * Validator for getting payrolls
 */
export const getPayrollsValidator = z.object({
  query: z.object({
    employeeId: z.string().optional(),
    branchId: z.string().optional(),
    month: z
      .string()
      .transform((val) => parseInt(val))
      .pipe(z.number().min(1).max(12))
      .optional(),
    year: z
      .string()
      .transform((val) => parseInt(val))
      .pipe(z.number().min(2020).max(2100))
      .optional(),
    status: z.enum(['draft', 'pending', 'approved', 'paid']).optional()
  })
})
