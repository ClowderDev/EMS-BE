import mongoose from 'mongoose'
import { BadRequestException } from '~/utils/app-error'
import jwt from 'jsonwebtoken'
import { Env } from '../config/env.config'
import EmployeeModel from '~/models/employee.model'
import { LoginSchemaType, RegisterSchemaType } from '~/validation/auth.validator'
import { Response } from 'express'
import { sendVerificationEmail } from '~/utils/email'

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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

      // Generate 6-digit verification code
      const verificationCode = generateVerificationCode()
      const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      const newUser = new EmployeeModel({
        ...body,
        branchId: new mongoose.Types.ObjectId(branchId),
        emailVerificationCode: verificationCode,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false
      })

      await newUser.save({ session })

      // Send verification email (only if email provided)
      if (newUser.email) {
        await sendVerificationEmail(newUser.email, newUser.name, verificationCode)
      }

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          branchId: newUser.branchId,
          isEmailVerified: newUser.isEmailVerified
        },
        message: 'Registration successful. Please check your email for the verification code.'
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
      // Find user by email or username
      const user = await EmployeeModel.findOne({
        $or: [{ email }, { username: email }]
      }).session(session)

      if (!user) {
        throw new BadRequestException('Invalid credentials')
      }

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials')
      }

      const { accessToken, refreshToken } = generateToken(user.id, user.email || user.username, user.role)

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
      } catch {
        throw new BadRequestException('Invalid refresh token')
      }

      const user = await EmployeeModel.findById(payload.employeeId).session(session)
      if (!user) {
        throw new BadRequestException('User not found')
      }

      const { accessToken, refreshToken: newRefreshToken } = generateToken(
        user.id,
        user.email || user.username,
        user.role
      )

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

/**
 * Verify email with 6-digit code
 */
export const verifyEmailService = async (email: string, code: string) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      // Case-insensitive email lookup
      const user = await EmployeeModel.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') }
      }).session(session)

      if (!user) {
        throw new BadRequestException('User not found')
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified')
      }

      if (!user.emailVerificationCode || !user.emailVerificationExpires) {
        throw new BadRequestException('No verification code found. Please request a new one.')
      }

      if (new Date() > user.emailVerificationExpires) {
        throw new BadRequestException('Verification code has expired. Please request a new one.')
      }

      if (user.emailVerificationCode !== code) {
        throw new BadRequestException('Invalid verification code')
      }

      // Mark email as verified
      user.isEmailVerified = true
      user.emailVerificationCode = undefined
      user.emailVerificationExpires = undefined
      await user.save({ session })

      return {
        message: 'Email verified successfully',
        user: user.omitPassword()
      }
    })
  } finally {
    await session.endSession()
  }
}

/**
 * Resend verification email
 */
export const resendVerificationEmailService = async (email: string) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      // Case-insensitive email lookup
      const user = await EmployeeModel.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') }
      }).session(session)

      if (!user) {
        throw new BadRequestException('User not found')
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified')
      }

      // Generate new 6-digit verification code
      const verificationCode = generateVerificationCode()
      const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      user.emailVerificationCode = verificationCode
      user.emailVerificationExpires = verificationExpires
      await user.save({ session })

      // Send verification email
      if (user.email) {
        await sendVerificationEmail(user.email, user.name, verificationCode)
      }

      return {
        message: 'Verification code has been resent to your email'
      }
    })
  } finally {
    await session.endSession()
  }
}

/**
 * Update email and send verification code (First-time email setup)
 */
export const updateEmailService = async (userId: string, email: string) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const user = await EmployeeModel.findById(userId).session(session)

      if (!user) {
        throw new BadRequestException('User not found')
      }

      // Check if email already exists (case-insensitive)
      const existingUser = await EmployeeModel.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') },
        _id: { $ne: userId }
      }).session(session)
      if (existingUser) {
        throw new BadRequestException('Email is already in use')
      }

      // Generate 6-digit verification code
      const verificationCode = generateVerificationCode()
      const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      user.email = email.toLowerCase()
      user.emailVerificationCode = verificationCode
      user.emailVerificationExpires = verificationExpires
      user.isEmailVerified = false
      await user.save({ session })

      // Send verification email
      await sendVerificationEmail(email, user.name, verificationCode)

      return {
        message: 'Email updated successfully. Please check your email for the verification code.',
        user: user.omitPassword()
      }
    })
  } finally {
    await session.endSession()
  }
}
