import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/asyncHandler.middlerware'
import * as reportService from '../services/report.service'
import { BadRequestException } from '../utils/app-error'

export const exportAttendanceController = asyncHandler(async (req: Request, res: Response) => {
  const { format, month, year, branchId, employeeId } = req.query

  const exportQuery = {
    month: parseInt(month as string),
    year: parseInt(year as string),
    branchId: branchId as string | undefined,
    employeeId: employeeId as string | undefined
  }

  if (format === 'csv') {
    await reportService.exportAttendanceCSV(exportQuery, res)
  } else if (format === 'pdf') {
    await reportService.exportAttendancePDF(exportQuery, res)
  } else {
    throw new BadRequestException('Invalid format. Use "csv" or "pdf"')
  }
})

export const exportEmployeesController = asyncHandler(async (req: Request, res: Response) => {
  const { branchId, role } = req.query

  const exportQuery = {
    branchId: branchId as string | undefined,
    role: role as string | undefined
  }

  await reportService.exportEmployeesCSV(exportQuery, res)
})
