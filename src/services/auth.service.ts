import mongoose from 'mongoose'
import { BadRequestException } from '~/utils/app-error'
import jwt from 'jsonwebtoken'
import { Env } from '../config/env.config'
import { signJwtToken } from '../utils/jwt'
import EmployeeModel from '~/models/employee.model'
import { LoginSchemaType, RegisterSchemaType } from '~/validation/auth.validator'
import { Response } from 'express'

function generateToken(employeeId: string, email: string, role: string) {
  const accessToken = jwt.sign({ employeeId, email, role }, process.env.JWT_SECRET!, {
    expiresIn: '60m'
  })
  const refreshToken = jwt.sign({ employeeId, email, role }, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  })
  return { accessToken, refreshToken }
}

async function setToken(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}

export const registerService = async (body: RegisterSchemaType) => {
  const { email, branchId } = body
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const existingUser = await EmployeeModel.findOne({ email }).session(session)

      if (existingUser) {
        throw new BadRequestException('User already exists with this email')
      }

      const newUser = new EmployeeModel({
        ...body,
        branchId: new mongoose.Types.ObjectId(branchId)
      })

      await newUser.save({ session })

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          branchId: newUser.branchId
        }
      }
    })
  } finally {
    await session.endSession()
  }
}

export const loginService = async (body: LoginSchemaType, res: Response) => {
  const { email, password } = body

  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const user = await EmployeeModel.findOne({ email }).session(session)
      if (!user) {
        throw new BadRequestException('Invalid email or password')
      }

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid email or password')
      }

      const { accessToken, refreshToken } = generateToken(user.id, user.email, user.role)

      await setToken(res, accessToken, refreshToken)

      await user.save()

      return {
        user: user.omitPassword(),
        accessToken,
        refreshToken
      }
    })
  } finally {
    await session.endSession()
  }
}

export const refreshTokenService = async (refreshToken: string, res: Response) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      if (!refreshToken) {
        throw new BadRequestException('Refresh token is required')
      }

      let payload: { employeeId: string; email: string; role: string }
      try {
        payload = jwt.verify(refreshToken, Env.JWT_SECRET) as { employeeId: string; email: string; role: string }
      } catch (error) {
        throw new BadRequestException('Invalid refresh token')
      }

      const user = await EmployeeModel.findById(payload.employeeId).session(session)
      if (!user) {
        throw new BadRequestException('User not found')
      }

      const { accessToken, refreshToken: newRefreshToken } = generateToken(user.id, user.email, user.role)

      await setToken(res, accessToken, newRefreshToken)

      return {
        user: user.omitPassword(),
        accessToken
      }
    })
  } finally {
    await session.endSession()
  }
}
