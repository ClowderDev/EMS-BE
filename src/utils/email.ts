import nodemailer from 'nodemailer'

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

// Template email reset password với OTP
export const sendResetPasswordOTPEmail = async (email: string, name: string, code: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code-box {
          background-color: #f4f4f4;
          border: 2px dashed #007bff;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #007bff;
          font-family: 'Courier New', monospace;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px;
          margin: 20px 0;
        }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🔐 Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password for your EMS account.</p>
        <p>Use the verification code below to reset your password:</p>
        
        <div class="code-box">
          <div class="code">${code}</div>
        </div>

        <div class="warning">
          <strong>⚠️ Important:</strong> This code will expire in 15 minutes.
        </div>

        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        
        <div class="footer">
          <p>Best regards,<br>EMS Team</p>
          <p style="color: #999; font-size: 11px;">This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Hi ${name},

    You requested to reset your password for your EMS account.

    Your password reset verification code is: ${code}

    This code will expire in 15 minutes.

    If you didn't request this password reset, please ignore this email.

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

// Send verification email with 6-digit code
export const sendVerificationEmail = async (email: string, name: string, code: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code-box {
          background-color: #f4f4f4;
          border: 2px dashed #007bff;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #007bff;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verify Your Email Address</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with EMS! Please use the verification code below to verify your email address:</p>
        <div class="code-box">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Verification Code</p>
          <div class="code">${code}</div>
        </div>
        <p><strong>This code will expire in 15 minutes.</strong></p>
        <p>If you didn't create an account with EMS, please ignore this email.</p>
        <div class="footer">
          <p>Best regards,<br>EMS Team</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Hi ${name},

    Thank you for registering with EMS! Please use the verification code below to verify your email address:

    Verification Code: ${code}

    This code will expire in 15 minutes.

    If you didn't create an account with EMS, please ignore this email.

    Best regards,
    EMS Team
  `

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - EMS System',
    html,
    text
  })
}
