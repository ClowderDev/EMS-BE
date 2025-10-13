import EmployeeModel from '~/models/employee.model'
import '~/models/branch.model' // Import để register Branch model cho populate
import { BadRequestException, NotFoundException } from '~/utils/app-error'
import {
  UpdateProfileSchemaType,
  ChangePasswordSchemaType,
  ForgotPasswordSchemaType
} from '~/validation/user.validator'
import crypto from 'crypto'
import { sendResetPasswordEmail } from '~/utils/email'

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

// Quên mật khẩu - gửi email reset
export const forgotPassword = async (data: ForgotPasswordSchemaType) => {
  const { email } = data

  const user = await EmployeeModel.findOne({ email })

  // Không tiết lộ thông tin user có tồn tại hay không (security best practice)
  if (!user) {
    return {
      message: 'If the email exists, a password reset link has been sent'
    }
  }

  // Tạo reset token (random 32 bytes)
  const resetToken = crypto.randomBytes(32).toString('hex')

  // Hash token trước khi lưu vào DB (security best practice)
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Lưu token và thời gian hết hạn (15 phút)
  user.resetPasswordToken = hashedToken
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  await user.save()

  // Gửi email với token gốc (không hash)
  try {
    await sendResetPasswordEmail(user.email, resetToken, user.name)
  } catch {
    // Nếu gửi email thất bại, xóa token
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    throw new BadRequestException('Failed to send reset password email')
  }

  return {
    message: 'If the email exists, a password reset link has been sent'
  }
}

// Reset mật khẩu với token
export const resetPassword = async (token: string, newPassword: string) => {
  // Hash token từ URL để so sánh với DB
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  // Tìm user với token và kiểm tra expiry
  const user = await EmployeeModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() } // Token chưa hết hạn
  })

  if (!user) {
    throw new BadRequestException('Invalid or expired reset token')
  }

  // Cập nhật mật khẩu mới
  user.password = newPassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()

  return {
    message: 'Password reset successfully'
  }
}
