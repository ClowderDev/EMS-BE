import { z } from 'zod'

/**
 * Schema for exporting attendance report
 */
export const exportAttendanceSchema = z.object({
  query: z.object({
    format: z.enum(['csv', 'pdf']),
    month: z.string().regex(/^\d+$/).transform(Number),
    year: z.string().regex(/^\d+$/).transform(Number),
    branchId: z.string().optional(),
    employeeId: z.string().optional()
  })
})

/**
 * Schema for exporting employees list
 */
export const exportEmployeesSchema = z.object({
  query: z.object({
    format: z.enum(['csv']),
    branchId: z.string().optional(),
    role: z.enum(['admin', 'manager', 'employee']).optional()
  })
})

export type ExportAttendanceInput = z.infer<typeof exportAttendanceSchema>
export type ExportEmployeesInput = z.infer<typeof exportEmployeesSchema>
