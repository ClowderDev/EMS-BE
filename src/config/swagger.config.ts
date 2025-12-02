import swaggerJsdoc from 'swagger-jsdoc'
import { Env } from './env.config'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EMS (Employee Management System) API',
      version: '1.0.0',
      description:
        'API documentation for Employee Management System with shift scheduling, attendance tracking, payroll, and messaging features',
      contact: {
        name: 'API Support',
        email: 'support@ems.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${Env.PORT}/api/v1`,
        description: 'Development server'
      },
      {
        url: 'https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token (from login response)'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'JWT token stored in cookie'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            statusCode: {
              type: 'integer',
              example: 400
            }
          }
        },
        Employee: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            username: {
              type: 'string',
              example: 'johndoe'
            },
            email: {
              type: 'string',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['employee', 'manager', 'admin'],
              example: 'employee'
            },
            branchId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            phone: {
              type: 'string',
              example: '0123456789'
            },
            isEmailVerified: {
              type: 'boolean',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Shift: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            shiftName: {
              type: 'string',
              example: 'Morning Shift'
            },
            startTime: {
              type: 'string',
              example: '08:00'
            },
            endTime: {
              type: 'string',
              example: '16:00'
            },
            branchId: {
              type: 'string'
            },
            maxEmployees: {
              type: 'integer',
              example: 10
            }
          }
        },
        Attendance: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            employeeId: {
              type: 'string'
            },
            shiftId: {
              type: 'string'
            },
            date: {
              type: 'string',
              format: 'date'
            },
            checkInTime: {
              type: 'string',
              format: 'date-time'
            },
            checkOutTime: {
              type: 'string',
              format: 'date-time'
            },
            status: {
              type: 'string',
              enum: ['checked-in', 'checked-out', 'absent']
            },
            workHours: {
              type: 'number',
              example: 8
            }
          }
        },
        SalaryGoal: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            employeeId: {
              type: 'string'
            },
            targetShifts: {
              type: 'integer',
              example: 16
            },
            month: {
              type: 'integer',
              example: 12
            },
            year: {
              type: 'integer',
              example: 2025
            },
            currentShifts: {
              type: 'integer',
              example: 12
            },
            currentEarnings: {
              type: 'number',
              example: 3500000
            },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'cancelled']
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        cookieAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Employees',
        description: 'Employee management endpoints'
      },
      {
        name: 'Branches',
        description: 'Branch management endpoints'
      },
      {
        name: 'Shifts',
        description: 'Shift schedule management'
      },
      {
        name: 'Shift Registrations',
        description: 'Employee shift registration and approval'
      },
      {
        name: 'Attendance',
        description: 'Attendance tracking (check-in/check-out)'
      },
      {
        name: 'Salary Goals',
        description: 'Employee salary goal tracking'
      },
      {
        name: 'Payroll',
        description: 'Payroll calculation and management'
      },
      {
        name: 'Messages',
        description: 'Internal messaging system'
      },
      {
        name: 'Notifications',
        description: 'Push notifications management'
      },
      {
        name: 'Violations',
        description: 'Employee violation tracking'
      },
      {
        name: 'Reports',
        description: 'Analytics and reporting'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
}

export const swaggerSpec = swaggerJsdoc(options)
