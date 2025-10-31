import type { Request, Response } from 'express'
import * as violationService from '~/services/violation.service'

/**
 * Create a new violation
 */
export const createViolationController = async (req: Request, res: Response) => {
  const violationData = {
    ...req.body,
    createdBy: req.user!.id
  }

  const violation = await violationService.createViolation(violationData)

  res.status(201).json({
    success: true,
    message: 'Violation created successfully',
    data: violation
  })
}

/**
 * Get violations with filters
 */
export const getViolationsController = async (req: Request, res: Response) => {
  const violations = await violationService.getViolations(req.query, req.user!.id, req.user!.role)

  res.status(200).json({
    success: true,
    message: 'Violations retrieved successfully',
    data: violations
  })
}

/**
 * Get single violation by ID
 */
export const getViolationByIdController = async (req: Request, res: Response) => {
  const violation = await violationService.getViolationById(req.params.id, req.user!.id, req.user!.role)

  res.status(200).json({
    success: true,
    message: 'Violation retrieved successfully',
    data: violation
  })
}

/**
 * Update violation
 */
export const updateViolationController = async (req: Request, res: Response) => {
  const violation = await violationService.updateViolation(req.params.id, req.body, req.user!.id)

  res.status(200).json({
    success: true,
    message: 'Violation updated successfully',
    data: violation
  })
}

/**
 * Acknowledge violation (employee)
 */
export const acknowledgeViolationController = async (req: Request, res: Response) => {
  const violation = await violationService.acknowledgeViolation(req.params.id, req.user!.id)

  res.status(200).json({
    success: true,
    message: 'Violation acknowledged successfully',
    data: violation
  })
}

/**
 * Delete violation (admin only)
 */
export const deleteViolationController = async (req: Request, res: Response) => {
  await violationService.deleteViolation(req.params.id, req.user!.role)

  res.status(200).json({
    success: true,
    message: 'Violation deleted successfully'
  })
}
