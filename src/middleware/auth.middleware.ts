import EmployeeModel from '~/models/employee.model'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Env } from '../config/env.config'
import { HTTPSTATUS } from '../config/http.config'
import { ErrorCodeEnum } from '../enums/error-code.enum'

interface TokenPayload {
  employeeId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    //Kiểm tra xem header auth có chứa token hay không
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: 'Access token is required',
        errorCode: ErrorCodeEnum.AUTH_TOKEN_NOT_FOUND
      })
    }

    // Lấy token từ header bỏ tiền tố "Bearer "
    const token = authHeader.substring(7)

    if (!token) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: 'Access token is required',
        errorCode: ErrorCodeEnum.AUTH_TOKEN_NOT_FOUND
      })
    }

    //Xác thực token
    let payload: TokenPayload
    try {
      payload = jwt.verify(token, Env.JWT_SECRET) as TokenPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(HTTPSTATUS.UNAUTHORIZED).json({
          message: 'Access token has expired',
          errorCode: ErrorCodeEnum.AUTH_INVALID_TOKEN
        })
      }

      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: 'Invalid access token',
        errorCode: ErrorCodeEnum.AUTH_INVALID_TOKEN
      })
    }

    // Tìm employee dựa trên employeeId từ token
    const employee = await EmployeeModel.findById(payload.employeeId)

    if (!employee) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: 'Employee not found',
        errorCode: ErrorCodeEnum.AUTH_USER_NOT_FOUND
      })
    }

    //Gán vào request object để sử dụng trong các controller
    req.user = employee as Express.User

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Authentication failed',
      errorCode: ErrorCodeEnum.INTERNAL_SERVER_ERROR
    })
  }
}
