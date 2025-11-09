import { z } from 'zod'

export const createEmployeeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name is too long'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username is too long'),
  email: z.string().email('Invalid email address').optional(), // Email is optional
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  role: z.enum(['employee', 'manager', 'admin']).default('employee'),
  branchId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID format')
})

export const updateEmployeeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name is too long').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username is too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  branchId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID format')
    .optional()
})

export const updateEmployeeRoleSchema = z.object({
  role: z.enum(['employee', 'manager', 'admin'])
})

export const employeeIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID format')
})

export const getEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(), // Tìm kiếm theo tên, email
  role: z.enum(['employee', 'manager', 'admin']).optional(), // Filter theo role
  branchId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID format - must be a valid MongoDB ObjectId')
    .optional(), // Filter theo chi nhánh
  sortBy: z.enum(['name', 'email', 'role', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

export type EmployeeIdSchemaType = z.infer<typeof employeeIdSchema>
export type UpdateEmployeeRoleSchemaType = z.infer<typeof updateEmployeeRoleSchema>
export type UpdateEmployeeSchemaType = z.infer<typeof updateEmployeeSchema>
export type CreateEmployeeSchemaType = z.infer<typeof createEmployeeSchema>
export type GetEmployeesQuerySchemaType = z.infer<typeof getEmployeesQuerySchema>
