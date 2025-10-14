import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { Request, Response } from 'express'
import { HTTPSTATUS } from '~/config/http.config'
import { getBranches, getBranchById, createBranch, updateBranch, deleteBranch } from '~/services/branch.service'
import {
  createBranchSchema,
  updateBranchSchema,
  branchIdSchema,
  getBranchesQuerySchema
} from '~/validation/branch.validator'

export const getBranchesController = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = getBranchesQuerySchema.parse(req.query)

  const result = await getBranches(validatedQuery)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get branches successfully',
    data: result.branches,
    pagination: result.pagination
  })
})

export const getBranchByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = branchIdSchema.parse(req.params)

  const result = await getBranchById(id)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get branch successfully',
    data: result
  })
})

export const createBranchController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createBranchSchema.parse(req.body)

  const result = await createBranch(validatedData)

  return res.status(HTTPSTATUS.CREATED).json({
    message: 'Branch created successfully',
    data: result
  })
})

export const updateBranchController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = branchIdSchema.parse(req.params)

  const validatedData = updateBranchSchema.parse(req.body)

  const result = await updateBranch(id, validatedData)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Branch updated successfully',
    data: result
  })
})

export const deleteBranchController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = branchIdSchema.parse(req.params)

  const result = await deleteBranch(id)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: null
  })
})
