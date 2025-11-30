import type { Request, Response } from 'express'
import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import * as salaryGoalService from '~/services/salary-goal.service'
import { createGoalSchema, updateGoalSchema, goalIdSchema } from '~/validation/salary-goal.validator'

/**
 * Create or update salary goal for current/specified month
 */
export const createOrUpdateGoalController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createGoalSchema.parse(req.body)
  const employeeId = req.user!.id
  const goal = await salaryGoalService.createOrUpdateGoal({
    employeeId,
    ...validatedData
  })

  res.status(201).json({
    success: true,
    message: 'Salary goal set successfully',
    data: goal
  })
})

/**
 * Get current goal with progress and comparison
 */
export const getCurrentGoalController = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.user!.id
  const data = await salaryGoalService.getCurrentGoal(employeeId)

  res.status(200).json({
    success: true,
    message: 'Current goal retrieved successfully',
    data
  })
})

/**
 * Get goal history
 */
export const getGoalHistoryController = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.user!.id
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 6

  const history = await salaryGoalService.getGoalHistory(employeeId, limit)

  res.status(200).json({
    success: true,
    message: 'Goal history retrieved successfully',
    data: history
  })
})

/**
 * Update goal
 */
export const updateGoalController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = goalIdSchema.parse(req.params)
  const validatedData = updateGoalSchema.parse(req.body)
  const employeeId = req.user!.id

  const goal = await salaryGoalService.updateGoal(id, employeeId, validatedData)

  res.status(200).json({
    success: true,
    message: 'Goal updated successfully',
    data: goal
  })
})

/**
 * Delete goal
 */
export const deleteGoalController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = goalIdSchema.parse(req.params)
  const employeeId = req.user!.id

  await salaryGoalService.deleteGoal(id, employeeId)

  res.status(200).json({
    success: true,
    message: 'Goal deleted successfully'
  })
})
