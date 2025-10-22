import { Response } from 'express'
import { createObjectCsvWriter } from 'csv-writer'
import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'
import AttendanceModel from '../models/attendance.model'
import EmployeeModel from '../models/employee.model'
import BranchModel from '../models/branch.model'
import { BadRequestException } from '../utils/app-error'

interface ExportAttendanceQuery {
  month: number
  year: number
  branchId?: string
  employeeId?: string
}

interface ExportEmployeesQuery {
  branchId?: string
  role?: string
}

/**
 * Export attendance data to CSV
 */
export const exportAttendanceCSV = async (query: ExportAttendanceQuery, res: Response) => {
  const { month, year, branchId, employeeId } = query

  // Validate month and year
  if (month < 1 || month > 12) {
    throw new BadRequestException('Month must be between 1 and 12')
  }

  // Build date range
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  // Build query filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {
    createdAt: { $gte: startDate, $lte: endDate }
  }

  if (employeeId) {
    filter.employeeId = employeeId
  }

  // Fetch attendance records
  const attendances = await AttendanceModel.find(filter)
    .populate('employeeId', 'name email employeeCode')
    .populate('registrationId')
    .populate('shiftId', 'shiftName startTime endTime')
    .lean()

  // Filter by branchId if provided (after population)
  let filteredAttendances = attendances
  if (branchId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredAttendances = attendances.filter((att: any) => {
      return att.employeeId?.branchId?.toString() === branchId
    })
  }

  // Prepare CSV data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const csvData = filteredAttendances.map((attendance: any) => {
    const employee = attendance.employeeId
    const shift = attendance.shiftId

    return {
      date: new Date(attendance.date).toLocaleDateString(),
      employeeCode: employee?.employeeCode || 'N/A',
      employeeName: employee?.name || 'N/A',
      email: employee?.email || 'N/A',
      shiftName: shift?.shiftName || 'N/A',
      shiftTime: shift ? `${shift.startTime} - ${shift.endTime}` : 'N/A',
      checkInTime: attendance.checkInTime || 'N/A',
      checkOutTime: attendance.checkOutTime || 'N/A',
      workHours: attendance.workHours?.toFixed(2) || '0',
      status: attendance.status
    }
  })

  // Create CSV file
  const fileName = `attendance_${year}_${month}_${Date.now()}.csv`
  const filePath = path.join(process.cwd(), 'exports', fileName)

  // Ensure exports directory exists
  const exportsDir = path.join(process.cwd(), 'exports')
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true })
  }

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'date', title: 'Date' },
      { id: 'employeeCode', title: 'Employee Code' },
      { id: 'employeeName', title: 'Employee Name' },
      { id: 'email', title: 'Email' },
      { id: 'shiftName', title: 'Shift Name' },
      { id: 'shiftTime', title: 'Shift Time' },
      { id: 'checkInTime', title: 'Check In' },
      { id: 'checkOutTime', title: 'Check Out' },
      { id: 'workHours', title: 'Work Hours' },
      { id: 'status', title: 'Status' }
    ]
  })

  await csvWriter.writeRecords(csvData)

  // Send file
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Error sending file:', err)
    }
    // Clean up file after sending
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error('Error deleting file:', unlinkErr)
    })
  })
}

/**
 * Export attendance data to PDF
 */
export const exportAttendancePDF = async (query: ExportAttendanceQuery, res: Response) => {
  const { month, year, branchId, employeeId } = query

  // Validate month and year
  if (month < 1 || month > 12) {
    throw new BadRequestException('Month must be between 1 and 12')
  }

  // Build date range
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  // Build query filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {
    createdAt: { $gte: startDate, $lte: endDate }
  }

  if (employeeId) {
    filter.employeeId = employeeId
  }

  // Fetch attendance records
  const attendances = await AttendanceModel.find(filter)
    .populate('employeeId', 'name email employeeCode branchId')
    .populate('shiftId', 'shiftName startTime endTime')
    .lean()

  // Filter by branchId if provided
  let filteredAttendances = attendances
  if (branchId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredAttendances = attendances.filter((att: any) => {
      return att.employeeId?.branchId?.toString() === branchId
    })
  }

  // Get branch name if branchId provided
  let branchName = 'All Branches'
  if (branchId) {
    const branch = await BranchModel.findById(branchId).lean()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    branchName = (branch as any)?.name || 'Unknown Branch'
  }

  // Create PDF
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  const fileName = `attendance_${year}_${month}_${Date.now()}.pdf`
  const filePath = path.join(process.cwd(), 'exports', fileName)

  // Ensure exports directory exists
  const exportsDir = path.join(process.cwd(), 'exports')
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true })
  }

  const writeStream = fs.createWriteStream(filePath)
  doc.pipe(writeStream)

  // Header
  doc.fontSize(20).text('Attendance Report', { align: 'center' })
  doc.fontSize(12).text(`Month: ${month}/${year}`, { align: 'center' })
  doc.text(`Branch: ${branchName}`, { align: 'center' })
  doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
  doc.moveDown(2)

  // Summary
  const totalRecords = filteredAttendances.length
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalWorkHours = filteredAttendances.reduce((sum: number, att: any) => sum + (att.workHours || 0), 0)

  doc.fontSize(14).text('Summary', { underline: true })
  doc.fontSize(10)
  doc.text(`Total Records: ${totalRecords}`)
  doc.text(`Total Work Hours: ${totalWorkHours.toFixed(2)} hours`)
  doc.moveDown(1)

  // Table header
  doc.fontSize(8).font('Helvetica-Bold')
  const startY = doc.y
  doc.text('Date', 50, startY, { width: 60 })
  doc.text('Employee', 110, startY, { width: 80 })
  doc.text('Shift', 190, startY, { width: 80 })
  doc.text('Check In', 270, startY, { width: 60 })
  doc.text('Check Out', 330, startY, { width: 60 })
  doc.text('Hours', 390, startY, { width: 40 })
  doc.text('Status', 430, startY, { width: 60 })

  doc.moveDown(0.5)
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
  doc.moveDown(0.5)

  // Table rows
  doc.font('Helvetica')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filteredAttendances.forEach((attendance: any, index: number) => {
    const employee = attendance.employeeId
    const shift = attendance.shiftId
    const y = doc.y

    // Check if we need a new page
    if (y > 700) {
      doc.addPage()
      doc.fontSize(8).font('Helvetica-Bold')
      const headerY = 50
      doc.text('Date', 50, headerY, { width: 60 })
      doc.text('Employee', 110, headerY, { width: 80 })
      doc.text('Shift', 190, headerY, { width: 80 })
      doc.text('Check In', 270, headerY, { width: 60 })
      doc.text('Check Out', 330, headerY, { width: 60 })
      doc.text('Hours', 390, headerY, { width: 40 })
      doc.text('Status', 430, headerY, { width: 60 })
      doc.moveDown(0.5)
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      doc.moveDown(0.5)
      doc.font('Helvetica')
    }

    const rowY = doc.y
    doc.fontSize(7)
    doc.text(new Date(attendance.date).toLocaleDateString(), 50, rowY, { width: 60 })
    doc.text(employee?.name || 'N/A', 110, rowY, { width: 80 })
    doc.text(shift?.shiftName || 'N/A', 190, rowY, { width: 80 })
    doc.text(attendance.checkInTime || '-', 270, rowY, { width: 60 })
    doc.text(attendance.checkOutTime || '-', 330, rowY, { width: 60 })
    doc.text(attendance.workHours?.toFixed(1) || '0', 390, rowY, { width: 40 })
    doc.text(attendance.status, 430, rowY, { width: 60 })

    doc.moveDown(0.8)

    // Add separator line every 5 rows
    if ((index + 1) % 5 === 0) {
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.3)
    }
  })

  // Footer
  doc.moveDown(2)
  doc.fontSize(8).text('End of Report', { align: 'center' })

  doc.end()

  // Wait for file to be written
  writeStream.on('finish', () => {
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err)
      }
      // Clean up file after sending
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr)
      })
    })
  })
}

/**
 * Export employees list to CSV
 */
export const exportEmployeesCSV = async (query: ExportEmployeesQuery, res: Response) => {
  const { branchId, role } = query

  // Build query filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {}
  if (branchId) filter.branchId = branchId
  if (role) filter.role = role

  // Fetch employees
  const employees = await EmployeeModel.find(filter).populate('branchId', 'name address').lean()

  // Prepare CSV data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const csvData = employees.map((employee: any) => {
    const branch = employee.branchId

    return {
      employeeCode: employee.employeeCode || 'N/A',
      name: employee.name,
      email: employee.email,
      phone: employee.phone || 'N/A',
      role: employee.role,
      branch: branch?.name || 'N/A',
      branchAddress: branch?.address || 'N/A',
      status: employee.isActive ? 'Active' : 'Inactive',
      joinDate: new Date(employee.createdAt).toLocaleDateString()
    }
  })

  // Create CSV file
  const fileName = `employees_${Date.now()}.csv`
  const filePath = path.join(process.cwd(), 'exports', fileName)

  // Ensure exports directory exists
  const exportsDir = path.join(process.cwd(), 'exports')
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true })
  }

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'employeeCode', title: 'Employee Code' },
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'role', title: 'Role' },
      { id: 'branch', title: 'Branch' },
      { id: 'branchAddress', title: 'Branch Address' },
      { id: 'status', title: 'Status' },
      { id: 'joinDate', title: 'Join Date' }
    ]
  })

  await csvWriter.writeRecords(csvData)

  // Send file
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Error sending file:', err)
    }
    // Clean up file after sending
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error('Error deleting file:', unlinkErr)
    })
  })
}
