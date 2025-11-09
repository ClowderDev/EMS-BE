import EmployeeModel from '~/models/employee.model'
import '~/models/branch.model' // Import để register Branch model cho populate
import { BadRequestException, NotFoundException } from '~/utils/app-error'
import {
  UpdateProfileSchemaType,
  ChangePasswordSchemaType,
  ForgotPasswordSchemaType,
  VerifyResetPasswordOTPSchemaType,
  ResetPasswordSchemaType
} from '~/validation/user.validator'
import { sendResetPasswordOTPEmail } from '~/utils/email'

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Lấy thông tin profile
export const getUserProfile = async (userId: string) => {
  const user = await EmployeeModel.findById(userId).populate('branchId', 'branchName address')

  if (!user) {
    throw new NotFoundException('User not found')
  }

  return user.omitPassword()
}

// Cập nhật profile
export const updateUserProfile = async (userId: string, updateData: UpdateProfileSchemaType) => {
  // Kiểm tra nếu update email, phải đảm bảo email chưa tồn tại
  if (updateData.email) {
    const existingUser = await EmployeeModel.findOne({
      email: updateData.email,
      _id: { $ne: userId }
    })

    if (existingUser) {
      throw new BadRequestException('Email already exists')
    }
  }

  const user = await EmployeeModel.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true
  }).populate('branchId', 'branchName address')

  if (!user) {
    throw new NotFoundException('User not found')
  }

  return user.omitPassword()
}

// Đổi mật khẩu
export const changePassword = async (userId: string, data: ChangePasswordSchemaType) => {
  const { oldPassword, newPassword } = data

  const user = await EmployeeModel.findById(userId)

  if (!user) {
    throw new NotFoundException('User not found')
  }

  // Kiểm tra mật khẩu cũ
  const isPasswordValid = await user.comparePassword(oldPassword)
  if (!isPasswordValid) {
    throw new BadRequestException('Old password is incorrect')
  }

  // Cập nhật mật khẩu mới
  user.password = newPassword
  await user.save()

  return {
    message: 'Password changed successfully'
  }
}

// Quên mật khẩu - gửi OTP qua email
export const forgotPassword = async (data: ForgotPasswordSchemaType) => {
  const { email } = data

  // Case-insensitive email lookup
  const user = await EmployeeModel.findOne({
    email: { $regex: new RegExp(`^${email}$`, 'i') }
  })

  // Không tiết lộ thông tin user
  if (!user) {
    return {
      message: 'If the email exists, a password reset code has been sent'
    }
  }

  if (!user.email) {
    throw new BadRequestException('User does not have an email address')
  }

  // Generate 6-digit OTP code
  const resetCode = generateVerificationCode()
  const resetExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Lưu OTP và thời gian hết hạn
  user.resetPasswordToken = resetCode // Lưu code trực tiếp không hash
  user.resetPasswordExpires = resetExpires
  await user.save()

  // Gửi email với OTP
  try {
    await sendResetPasswordOTPEmail(user.email, user.name, resetCode)
  } catch {
    // Nếu gửi email thất bại, xóa OTP
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    throw new BadRequestException('Failed to send reset password email')
  }

  return {
    message: 'If the email exists, a password reset code has been sent'
  }
}

// Verify OTP code (optional endpoint để verify trước khi reset)
export const verifyResetPasswordOTP = async (data: VerifyResetPasswordOTPSchemaType) => {
  const { email, code } = data

  // Case-insensitive email lookup
  const user = await EmployeeModel.findOne({
    email: { $regex: new RegExp(`^${email}$`, 'i') }
  })

  if (!user) {
    throw new BadRequestException('Invalid verification code')
  }

  if (!user.resetPasswordToken || !user.resetPasswordExpires) {
    throw new BadRequestException('No reset code found. Please request a new one.')
  }

  if (new Date() > user.resetPasswordExpires) {
    throw new BadRequestException('Reset code has expired. Please request a new one.')
  }

  if (user.resetPasswordToken !== code) {
    throw new BadRequestException('Invalid verification code')
  }

  return {
    message: 'Reset code verified successfully. You can now reset your password.'
  }
}

// Reset mật khẩu với OTP
export const resetPassword = async (data: ResetPasswordSchemaType) => {
  const { email, code, newPassword } = data

  // Case-insensitive email lookup
  const user = await EmployeeModel.findOne({
    email: { $regex: new RegExp(`^${email}$`, 'i') }
  })

  if (!user) {
    throw new BadRequestException('Invalid or expired reset code')
  }

  if (!user.resetPasswordToken || !user.resetPasswordExpires) {
    throw new BadRequestException('No reset code found. Please request a new one.')
  }

  if (new Date() > user.resetPasswordExpires) {
    throw new BadRequestException('Reset code has expired. Please request a new one.')
  }

  if (user.resetPasswordToken !== code) {
    throw new BadRequestException('Invalid reset code')
  }

  // Cập nhật mật khẩu mới
  user.password = newPassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()

  return {
    message: 'Password reset successfully. You can now login with your new password.'
  }
}
