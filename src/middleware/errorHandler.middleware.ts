import { Response } from 'express'
import { z, ZodError } from 'zod'
import { ErrorRequestHandler } from 'express'
import { HTTPSTATUS } from '../config/http.config'
import { AppError } from '../utils/app-error'
import { ErrorCodeEnum } from '~/enums/error-code.enum'

//Format lỗi do Zod
const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join('.'),
    message: err.message
  }))
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: 'Validation failed',
    errors: errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR
  })
}

// Format lỗi do JSON parsing
const formatJSONParseError = (res: Response, error: { message: string }) => {
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: 'Invalid JSON format in request body',
    error: error.message,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR
  })
}

// Format lỗi do validate Mongoose
const formatMongooseValidationError = (res: Response, error: { name: string; errors: Record<string, unknown> }) => {
  const errors = Object.values(error.errors || {}).map((err) => {
    const validationError = err as { path: string; message: string; value?: unknown }
    return {
      field: validationError.path,
      message: validationError.message,
      value: validationError.value
    }
  })

  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: 'Validation failed',
    errors: errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  console.log('Error occurred on PATH:', req.path, 'Error:', error)

  // Xử lý lỗi JSON parsing
  if (error.type === 'entity.parse.failed' && error.statusCode === 400) {
    return formatJSONParseError(res, error)
  }

  // Xử lý lỗi SyntaxError từ JSON parsing
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return formatJSONParseError(res, error)
  }

  // Xử lý lỗi validate Mongoose
  if (error.name === 'ValidationError') {
    return formatMongooseValidationError(res, error)
  }

  if (error instanceof ZodError) {
    return formatZodError(res, error)
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode
    })
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: 'Internal Server Error',
    error: error?.message || 'Unknown error occurred'
  })
}
