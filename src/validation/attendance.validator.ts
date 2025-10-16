import { z } from 'zod'

// Schema cho check-in
export const checkInSchema = z.object({
  registrationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid registration ID format'),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  notes: z.string().max(500, 'Notes is too long').optional()
})

// Schema cho check-out
export const checkOutSchema = z.object({
  attendanceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attendance ID format'),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  notes: z.string().max(500, 'Notes is too long').optional()
})

// Schema cho query attendances
export const getAttendancesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.enum(['checked-in', 'checked-out', 'absent']).optional(),
  employeeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID format')
    .optional(),
  shiftId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid shift ID format')
    .optional(),
  startDate: z.string().optional(), // ISO date format
  endDate: z.string().optional(), // ISO date format
  sortBy: z.enum(['date', 'checkInTime', 'checkOutTime', 'workHours', 'createdAt']).optional().default('date'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

// Schema cho attendance ID param
export const attendanceIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attendance ID format')
})

// Schema cho monthly report
export const monthlyReportSchema = z.object({
  month: z.coerce.number().int().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.coerce.number().int().min(2020).max(2100, 'Year must be between 2020 and 2100'),
  employeeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID format')
    .optional()
})

export type MonthlyReportSchemaType = z.infer<typeof monthlyReportSchema>
export type CheckInSchemaType = z.infer<typeof checkInSchema>
export type AttendanceIdSchemaType = z.infer<typeof attendanceIdSchema>
export type GetAttendancesQuerySchemaType = z.infer<typeof getAttendancesQuerySchema>
export type CheckOutSchemaType = z.infer<typeof checkOutSchema>
