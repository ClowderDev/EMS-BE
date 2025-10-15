import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { Request, Response } from 'express'
import { HTTPSTATUS } from '~/config/http.config'
import { getShifts, getShiftById, createShift, updateShift, deleteShift } from '~/services/shift.service'
import { createShiftSchema, updateShiftSchema, shiftIdSchema, getShiftsQuerySchema } from '~/validation/shift.validator'

export const getShiftsController = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = getShiftsQuerySchema.parse(req.query)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getShifts(validatedQuery, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get shifts successfully',
    data: result.shifts,
    pagination: result.pagination
  })
})

export const getShiftByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = shiftIdSchema.parse(req.params)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getShiftById(id, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get shift successfully',
    data: result
  })
})

export const createShiftController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createShiftSchema.parse(req.body)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await createShift(validatedData, req.user! as any)

  return res.status(HTTPSTATUS.CREATED).json({
    message: 'Shift created successfully',
    data: result
  })
})

export const updateShiftController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = shiftIdSchema.parse(req.params)
  const validatedData = updateShiftSchema.parse(req.body)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await updateShift(id, validatedData, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Shift updated successfully',
    data: result
  })
})

export const deleteShiftController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = shiftIdSchema.parse(req.params)

  const result = await deleteShift(id)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: null
  })
})
