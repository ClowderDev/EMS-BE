import nodemailer from 'nodemailer'
import { Env } from '../config/env.config'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Tạo transporter (cấu hình email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
}

// Gửi email
export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"EMS System" <${process.env.EMAIL_USER}>`, // Tên người gửi
      to,
      subject,
      text,
      html
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

// Template email
export const sendResetPasswordEmail = async (email: string, resetToken: string, name: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password for your EMS account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p><strong>This link will expire in 15 minutes.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <div class="footer">
          <p>Best regards,<br>EMS Team</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Hi ${name},

    You requested to reset your password for your EMS account.

    Click this link to reset your password: ${resetUrl}

    This link will expire in 15 minutes.

    If you didn't request this, please ignore this email.

    Best regards,
    EMS Team
  `

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - EMS System',
    html,
    text
  })
}
