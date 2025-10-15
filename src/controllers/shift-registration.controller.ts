import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { Request, Response } from 'express'
import { HTTPSTATUS } from '~/config/http.config'
import {
  getRegistrations,
  createRegistration,
  approveRegistration,
  rejectRegistration,
  deleteRegistration
} from '~/services/shift-registration.service'
import {
  createShiftRegistrationSchema,
  updateRegistrationStatusSchema,
  registrationIdSchema,
  getRegistrationsQuerySchema
} from '~/validation/shift-registration.validator'

export const getRegistrationsController = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = getRegistrationsQuerySchema.parse(req.query)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getRegistrations(validatedQuery, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get registrations successfully',
    data: result.registrations,
    pagination: result.pagination
  })
})

export const createRegistrationController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createShiftRegistrationSchema.parse(req.body)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await createRegistration(validatedData, req.user! as any)

  return res.status(HTTPSTATUS.CREATED).json({
    message: 'Registration created successfully',
    data: result
  })
})

export const approveRegistrationController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = registrationIdSchema.parse(req.params)
  const validatedData = updateRegistrationStatusSchema.parse(req.body)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await approveRegistration(id, validatedData, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Registration approved successfully',
    data: result
  })
})

export const rejectRegistrationController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = registrationIdSchema.parse(req.params)
  const validatedData = updateRegistrationStatusSchema.parse(req.body)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await rejectRegistration(id, validatedData, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Registration rejected successfully',
    data: result
  })
})

export const deleteRegistrationController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = registrationIdSchema.parse(req.params)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await deleteRegistration(id, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: null
  })
})
