import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { Request, Response } from 'express'
import { HTTPSTATUS } from '~/config/http.config'
import { checkIn, checkOut, getAttendances, getAttendanceById, getMonthlyReport } from '~/services/attendance.service'
import {
  checkInSchema,
  checkOutSchema,
  getAttendancesQuerySchema,
  attendanceIdSchema,
  monthlyReportSchema
} from '~/validation/attendance.validator'

export const checkInController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = checkInSchema.parse(req.body)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await checkIn(validatedData, req.user! as any)

  return res.status(HTTPSTATUS.CREATED).json({
    message: 'Checked in successfully',
    data: result
  })
})

export const checkOutController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = checkOutSchema.parse(req.body)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await checkOut(validatedData, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Checked out successfully',
    data: result
  })
})

export const getAttendancesController = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = getAttendancesQuerySchema.parse(req.query)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getAttendances(validatedQuery, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get attendances successfully',
    data: result.attendances,
    pagination: result.pagination
  })
})

export const getAttendanceByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = attendanceIdSchema.parse(req.params)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getAttendanceById(id, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get attendance successfully',
    data: result
  })
})

export const getMonthlyReportController = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = monthlyReportSchema.parse(req.query)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getMonthlyReport(validatedQuery, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get monthly report successfully',
    data: result
  })
})
