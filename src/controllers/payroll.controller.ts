import type { Request, Response } from 'express'
import * as payrollService from '~/services/payroll.service'

/**
 * Calculate and create payroll for an employee
 */
export const calculatePayrollController = async (req: Request, res: Response) => {
  const payroll = await payrollService.calculatePayroll(req.body)

  res.status(201).json({
    success: true,
    message: 'Payroll calculated and created successfully',
    data: payroll
  })
}

/**
 * Get payrolls with filters
 */
export const getPayrollsController = async (req: Request, res: Response) => {
  const payrolls = await payrollService.getPayrolls(req.query, req.user!.id, req.user!.role)

  res.status(200).json({
    success: true,
    message: 'Payrolls retrieved successfully',
    data: payrolls
  })
}

/**
 * Get single payroll by ID
 */
export const getPayrollByIdController = async (req: Request, res: Response) => {
  const payroll = await payrollService.getPayrollById(req.params.id, req.user!.id, req.user!.role)

  res.status(200).json({
    success: true,
    message: 'Payroll retrieved successfully',
    data: payroll
  })
}

/**
 * Update payroll status (approve/reject/mark as paid)
 */
export const updatePayrollStatusController = async (req: Request, res: Response) => {
  const payroll = await payrollService.updatePayrollStatus(req.params.id, req.body, req.user!.id, req.user!.role)

  res.status(200).json({
    success: true,
    message: 'Payroll status updated successfully',
    data: payroll
  })
}

/**
 * Delete payroll (admin only, draft only)
 */
export const deletePayrollController = async (req: Request, res: Response) => {
  await payrollService.deletePayroll(req.params.id, req.user!.id, req.user!.role)

  res.status(200).json({
    success: true,
    message: 'Payroll deleted successfully'
  })
}

/**
 * Recalculate payroll (manager/admin, draft only)
 */
export const recalculatePayrollController = async (req: Request, res: Response) => {
  const payroll = await payrollService.recalculatePayroll(req.params.id, req.user!.id, req.user!.role)

  res.status(200).json({
    success: true,
    message: 'Payroll recalculated successfully',
    data: payroll
  })
}
