import type { Request, Response, NextFunction } from 'express'
import { HTTPSTATUS } from '../config/http.config'
import { ErrorCodeEnum } from '../enums/error-code.enum'

type Role = 'admin' | 'manager' | 'employee'

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Kiểm tra xem user đã được authenticate chưa
    if (!req.user) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: 'Authentication required',
        errorCode: ErrorCodeEnum.AUTH_USER_NOT_FOUND
      })
    }

    const userRole = req.user.role as Role

    // Kiểm tra xem role của user có trong danh sách allowed roles không
    if (!allowedRoles.includes(userRole)) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED
      })
    }

    // User có quyền, cho phép tiếp tục
    next()
  }
}

export const adminOnly = requireRole(['admin'])

export const adminOrManager = requireRole(['admin', 'manager'])

export const authenticatedOnly = requireRole(['admin', 'manager', 'employee'])
