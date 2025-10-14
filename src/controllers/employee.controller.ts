import { asyncHandler } from '~/middleware/asyncHandler.middlerware'
import { Request, Response } from 'express'
import { HTTPSTATUS } from '~/config/http.config'
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeRole
} from '~/services/employee.service'
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeRoleSchema,
  employeeIdSchema,
  getEmployeesQuerySchema
} from '~/validation/employee.validator'

export const getEmployeesController = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = getEmployeesQuerySchema.parse(req.query)

  const result = await getEmployees(validatedQuery, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get employees successfully',
    data: result.employees,
    pagination: result.pagination
  })
})

export const getEmployeeByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = employeeIdSchema.parse(req.params)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await getEmployeeById(id, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Get employee successfully',
    data: result
  })
})

export const createEmployeeController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createEmployeeSchema.parse(req.body)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await createEmployee(validatedData, req.user! as any)

  return res.status(HTTPSTATUS.CREATED).json({
    message: 'Employee created successfully',
    data: result
  })
})

export const updateEmployeeController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = employeeIdSchema.parse(req.params)
  const validatedData = updateEmployeeSchema.parse(req.body)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await updateEmployee(id, validatedData, req.user! as any)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Employee updated successfully',
    data: result
  })
})

export const deleteEmployeeController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = employeeIdSchema.parse(req.params)

  const result = await deleteEmployee(id)

  return res.status(HTTPSTATUS.OK).json({
    message: result.message,
    data: null
  })
})

export const updateEmployeeRoleController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = employeeIdSchema.parse(req.params)
  const validatedData = updateEmployeeRoleSchema.parse(req.body)

  const result = await updateEmployeeRole(id, validatedData)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Employee role updated successfully',
    data: result
  })
})
