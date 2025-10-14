import { z } from 'zod'

export const createBranchSchema = z.object({
  branchName: z.string().min(3, 'Branch name must be at least 3 characters').max(100, 'Branch name is too long'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address is too long')
})

export const updateBranchSchema = z.object({
  branchName: z
    .string()
    .min(3, 'Branch name must be at least 3 characters')
    .max(100, 'Branch name is too long')
    .optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address is too long').optional()
})

export const branchIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID format')
})

// Schema cho query parameters
export const getBranchesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(), // Tìm kiếm theo tên hoặc địa chỉ
  sortBy: z.enum(['branchName', 'address', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

export type CreateBranchSchemaType = z.infer<typeof createBranchSchema>
export type GetBranchesQuerySchemaType = z.infer<typeof getBranchesQuerySchema>
export type UpdateBranchSchemaType = z.infer<typeof updateBranchSchema>
export type BranchIdSchemaType = z.infer<typeof branchIdSchema>
