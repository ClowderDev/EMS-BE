import mongoose from 'mongoose'
import { config } from 'dotenv'
import BranchModel from '../models/branch.model'
import EmployeeModel from '../models/employee.model'
import ShiftModel from '../models/shift.model'
import ShiftRegistrationModel from '../models/shift_registration.model'
import AttendanceModel from '../models/attendance.model'
import MessageModel from '../models/message.model'
import NotificationModel from '../models/notification.model'
import { hashValue } from '../utils/bcrypt'

// Load environment variables
config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ems'

// Seed data
const branches = [
  {
    branchName: 'Head Office',
    address: '123 Main Street, Downtown, New York, NY 10001',
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      radius: 500
    }
  },
  {
    branchName: 'West Branch',
    address: '456 West Avenue, Los Angeles, CA 90001',
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
      radius: 300
    }
  },
  {
    branchName: 'East Branch',
    address: '789 East Road, Boston, MA 02101',
    location: {
      latitude: 42.3601,
      longitude: -71.0589,
      radius: 400
    }
  },
  {
    branchName: 'South Branch',
    address: '321 South Boulevard, Miami, FL 33101',
    location: {
      latitude: 25.7617,
      longitude: -80.1918,
      radius: 600
    }
  }
]

const getEmployeesData = (branchIds: mongoose.Types.ObjectId[]) => [
  // Admin users
  {
    name: 'John Admin',
    role: 'admin',
    branchId: branchIds[0],
    phone: '+1234567890',
    email: 'admin@ems.com',
    password: 'Admin@123'
  },
  {
    name: 'Sarah Administrator',
    role: 'admin',
    branchId: branchIds[0],
    phone: '+1234567891',
    email: 'sarah.admin@ems.com',
    password: 'Admin@123'
  },

  // Managers for each branch
  {
    name: 'Michael Manager',
    role: 'manager',
    branchId: branchIds[0],
    phone: '+1234567892',
    email: 'michael.manager@ems.com',
    password: 'Manager@123'
  },
  {
    name: 'Emily West',
    role: 'manager',
    branchId: branchIds[1],
    phone: '+1234567893',
    email: 'emily.west@ems.com',
    password: 'Manager@123'
  },
  {
    name: 'David East',
    role: 'manager',
    branchId: branchIds[2],
    phone: '+1234567894',
    email: 'david.east@ems.com',
    password: 'Manager@123'
  },
  {
    name: 'Lisa South',
    role: 'manager',
    branchId: branchIds[3],
    phone: '+1234567895',
    email: 'lisa.south@ems.com',
    password: 'Manager@123'
  },

  // Employees for Head Office
  {
    name: 'Alice Johnson',
    role: 'employee',
    branchId: branchIds[0],
    phone: '+1234567896',
    email: 'alice.johnson@ems.com',
    password: 'Employee@123'
  },
  {
    name: 'Bob Smith',
    role: 'employee',
    branchId: branchIds[0],
    phone: '+1234567897',
    email: 'bob.smith@ems.com',
    password: 'Employee@123'
  },
  {
    name: 'Charlie Brown',
    role: 'employee',
    branchId: branchIds[0],
    phone: '+1234567898',
    email: 'charlie.brown@ems.com',
    password: 'Employee@123'
  },
  {
    name: 'Diana Prince',
    role: 'employee',
    branchId: branchIds[0],
    phone: '+1234567899',
    email: 'diana.prince@ems.com',
    password: 'Employee@123'
  },

  // Employees for West Branch
  {
    name: 'Frank Wilson',
    role: 'employee',
    branchId: branchIds[1],
    phone: '+1234567800',
    email: 'frank.wilson@ems.com',
    password: 'Employee@123'
  },
  {
    name: 'Grace Lee',
    role: 'employee',
    branchId: branchIds[1],
    phone: '+1234567801',
    email: 'grace.lee@ems.com',
    password: 'Employee@123'
  },
  {
    name: 'Henry Chen',
    role: 'employee',
    branchId: branchIds[1],
    phone: '+1234567802',
    email: 'henry.chen@ems.com',
    password: 'Employee@123'
  },
  {
    name: 'Ivy Martinez',
    role: 'employee',
    branchId: branchIds[1],
    phone: '+1234567803',
    email: 'ivy.martinez@ems.com',
    password: 'Employee@123'
  },

  // Employees for East Branch
  {
    name: 'Jack Taylor',
    role: 'employee',
    branchId: branchIds[2],
    phone: '+1234567804',
    email: 'jack.taylor@ems.com',
    password: 'Employee@123'
  },
  {
    name: 'Karen White',
    role: 'employee',
    branchId: branchIds[2],
    phone: '+1234567805',
    email: 'karen.white@ems.com',
    password: 'Employee@123'
  },
  {
    name: 'Leo Harris',
    role: 'employee',
    branchId: branchIds[2],
    phone: '+1234567806',
    email: 'leo.harris@ems.com',
    password: 'Employee@123'
  },

  // Employees for South Branch
  {
    name: 'Mia Garcia',
    role: 'employee',
    branchId: branchIds[3],
    phone: '+1234567807',
    email: 'mia.garcia@ems.com',
    password: 'Employee@123'
  },
  {
    name: 'Nathan Clark',
    role: 'employee',
    branchId: branchIds[3],
    phone: '+1234567808',
    email: 'nathan.clark@ems.com',
    password: 'Employee@123'
  },
  {
    name: 'Olivia Rodriguez',
    role: 'employee',
    branchId: branchIds[3],
    phone: '+1234567809',
    email: 'olivia.rodriguez@ems.com',
    password: 'Employee@123'
  }
]

const getShiftsData = (branchIds: mongoose.Types.ObjectId[]) => [
  // Head Office Shifts
  {
    shiftName: 'Morning Shift',
    startTime: '08:00',
    endTime: '16:00',
    branchId: branchIds[0],
    maxEmployees: 10,
    description: 'Regular morning shift for head office'
  },
  {
    shiftName: 'Evening Shift',
    startTime: '16:00',
    endTime: '00:00',
    branchId: branchIds[0],
    maxEmployees: 8,
    description: 'Evening shift for head office'
  },
  {
    shiftName: 'Night Shift',
    startTime: '00:00',
    endTime: '08:00',
    branchId: branchIds[0],
    maxEmployees: 5,
    description: 'Night shift for head office'
  },

  // West Branch Shifts
  {
    shiftName: 'Morning Shift',
    startTime: '07:00',
    endTime: '15:00',
    branchId: branchIds[1],
    maxEmployees: 8,
    description: 'Morning shift for west branch'
  },
  {
    shiftName: 'Afternoon Shift',
    startTime: '15:00',
    endTime: '23:00',
    branchId: branchIds[1],
    maxEmployees: 6,
    description: 'Afternoon shift for west branch'
  },

  // East Branch Shifts
  {
    shiftName: 'Day Shift',
    startTime: '09:00',
    endTime: '17:00',
    branchId: branchIds[2],
    maxEmployees: 10,
    description: 'Standard day shift for east branch'
  },
  {
    shiftName: 'Evening Shift',
    startTime: '17:00',
    endTime: '01:00',
    branchId: branchIds[2],
    maxEmployees: 5,
    description: 'Evening shift for east branch'
  },

  // South Branch Shifts
  {
    shiftName: 'Early Morning',
    startTime: '06:00',
    endTime: '14:00',
    branchId: branchIds[3],
    maxEmployees: 7,
    description: 'Early morning shift for south branch'
  },
  {
    shiftName: 'Late Shift',
    startTime: '14:00',
    endTime: '22:00',
    branchId: branchIds[3],
    maxEmployees: 6,
    description: 'Late shift for south branch'
  }
]

const getShiftRegistrations = (employeeIds: mongoose.Types.ObjectId[], shiftIds: mongoose.Types.ObjectId[]) => {
  const registrations = []
  const today = new Date()
  const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected']

  // Create registrations for the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() + dayOffset)
    date.setHours(0, 0, 0, 0)

    // Register employees for different shifts (skip admins and some managers)
    for (let i = 6; i < employeeIds.length; i++) {
      const shiftIndex = i % shiftIds.length
      const statusIndex = dayOffset < 3 ? 1 : Math.floor(Math.random() * 3) // Past days are approved

      registrations.push({
        employeeId: employeeIds[i],
        shiftId: shiftIds[shiftIndex],
        date: new Date(date),
        status: statuses[statusIndex],
        note: statusIndex === 2 ? 'Unable to work this shift' : ''
      })
    }
  }

  return registrations
}

const getAttendanceData = (
  registrations: Array<{
    _id: mongoose.Types.ObjectId
    employeeId: mongoose.Types.ObjectId
    shiftId: mongoose.Types.ObjectId
    date: Date
    status: string
  }>,
  branchLocations: Array<{ latitude: number; longitude: number }>
) => {
  const attendanceRecords = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Only create attendance for approved registrations in the past 3 days
  const approvedRegs = registrations.filter((reg) => {
    const regDate = new Date(reg.date)
    const daysDiff = Math.floor((today.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24))
    return reg.status === 'approved' && daysDiff >= 0 && daysDiff < 3
  })

  for (const reg of approvedRegs) {
    const regDate = new Date(reg.date)
    const daysDiff = Math.floor((today.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24))

    // Get a random branch location for check-in/out
    const location = branchLocations[Math.floor(Math.random() * branchLocations.length)]

    // Randomize attendance status
    const hasCheckedIn = Math.random() > 0.1 // 90% checked in
    const hasCheckedOut = hasCheckedIn && daysDiff > 0 ? Math.random() > 0.15 : false // 85% checked out if day is past

    let checkInTime = null
    let checkOutTime = null
    let status: 'checked-in' | 'checked-out' | 'absent' = 'absent'
    let workHours = null

    if (hasCheckedIn) {
      // Set check-in time
      checkInTime = new Date(regDate)
      checkInTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))

      if (hasCheckedOut) {
        // Set check-out time
        checkOutTime = new Date(checkInTime)
        checkOutTime.setHours(checkOutTime.getHours() + 8 + Math.floor(Math.random() * 2))
        status = 'checked-out'
        workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
      } else {
        status = 'checked-in'
      }
    }

    attendanceRecords.push({
      employeeId: reg.employeeId,
      shiftId: reg.shiftId,
      registrationId: reg._id,
      date: reg.date,
      checkInTime,
      checkOutTime,
      checkInLocation: hasCheckedIn
        ? {
            latitude: location.latitude + (Math.random() - 0.5) * 0.001,
            longitude: location.longitude + (Math.random() - 0.5) * 0.001
          }
        : null,
      checkOutLocation: hasCheckedOut
        ? {
            latitude: location.latitude + (Math.random() - 0.5) * 0.001,
            longitude: location.longitude + (Math.random() - 0.5) * 0.001
          }
        : null,
      status,
      notes: status === 'absent' ? 'No show' : null,
      workHours
    })
  }

  return attendanceRecords
}

const getMessagesData = (employeeIds: mongoose.Types.ObjectId[], branchIds: mongoose.Types.ObjectId[]) => {
  const messages = []
  const now = new Date()

  // Group messages for each branch
  for (let i = 0; i < branchIds.length; i++) {
    const branchId = branchIds[i]
    const managerIndex = 2 + i // Managers start at index 2

    // Manager sends group message
    messages.push({
      branchId,
      senderId: employeeIds[managerIndex],
      messageType: 'group',
      content: `Hello team! This is ${i === 0 ? 'Michael' : i === 1 ? 'Emily' : i === 2 ? 'David' : 'Lisa'}. Let's have a great week!`,
      isRead: false,
      readBy: [employeeIds[managerIndex]],
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
    })

    // Employee responds to group
    messages.push({
      branchId,
      senderId: employeeIds[6 + i * 3],
      messageType: 'group',
      content: 'Thanks! Looking forward to it.',
      isRead: false,
      readBy: [employeeIds[6 + i * 3]],
      timestamp: new Date(now.getTime() - 23 * 60 * 60 * 1000)
    })
  }

  // Direct messages between employees
  messages.push({
    branchId: branchIds[0],
    senderId: employeeIds[6], // Alice
    receiverId: employeeIds[7], // Bob
    messageType: 'direct',
    content: 'Hey Bob, can you help me with the project?',
    isRead: true,
    readBy: [employeeIds[6], employeeIds[7]],
    timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000)
  })

  messages.push({
    branchId: branchIds[0],
    senderId: employeeIds[7], // Bob
    receiverId: employeeIds[6], // Alice
    messageType: 'direct',
    content: 'Sure! I can help you after lunch.',
    isRead: true,
    readBy: [employeeIds[6], employeeIds[7]],
    timestamp: new Date(now.getTime() - 11 * 60 * 60 * 1000)
  })

  // Manager to employee direct message
  messages.push({
    branchId: branchIds[1],
    senderId: employeeIds[3], // Emily (manager)
    receiverId: employeeIds[10], // Frank
    messageType: 'direct',
    content: 'Frank, please review the attendance report and get back to me.',
    isRead: false,
    readBy: [employeeIds[3]],
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000)
  })

  return messages
}

const getNotificationsData = (employeeIds: mongoose.Types.ObjectId[]) => {
  const notifications = []
  const now = new Date()

  // Notifications for each employee (skip some admins)
  for (let i = 2; i < employeeIds.length; i++) {
    // Shift approval notification
    notifications.push({
      employeeId: employeeIds[i],
      title: 'Shift Registration Approved',
      message: 'Your shift registration for tomorrow has been approved.',
      date: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      status: Math.random() > 0.5 ? 'read' : 'unread'
    })

    // Reminder notification
    notifications.push({
      employeeId: employeeIds[i],
      title: 'Shift Reminder',
      message: "Don't forget to check in for your shift at 8:00 AM tomorrow.",
      date: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      status: Math.random() > 0.3 ? 'read' : 'unread'
    })

    // Only some employees get overtime notification
    if (i % 3 === 0) {
      notifications.push({
        employeeId: employeeIds[i],
        title: 'Overtime Alert',
        message: 'You have accumulated 5 hours of overtime this week.',
        date: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        status: 'unread'
      })
    }
  }

  // Special notifications for managers
  for (let i = 2; i < 6; i++) {
    notifications.push({
      employeeId: employeeIds[i],
      title: 'Pending Approvals',
      message: 'You have 3 shift registrations pending approval.',
      date: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      status: 'unread'
    })
  }

  return notifications
}

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await Promise.all([
      BranchModel.deleteMany({}),
      EmployeeModel.deleteMany({}),
      ShiftModel.deleteMany({}),
      ShiftRegistrationModel.deleteMany({}),
      AttendanceModel.deleteMany({}),
      MessageModel.deleteMany({}),
      NotificationModel.deleteMany({})
    ])
    console.log('✅ Cleared existing data')

    // Create Branches
    console.log('🏢 Creating branches...')
    const createdBranches = await BranchModel.insertMany(branches)
    const branchIds = createdBranches.map((b) => b._id as mongoose.Types.ObjectId)
    console.log(`✅ Created ${createdBranches.length} branches`)

    // Create Employees
    console.log('👥 Creating employees...')
    const employeesData = getEmployeesData(branchIds)

    // Hash passwords before inserting (insertMany bypasses pre-save hooks)
    const employeesWithHashedPasswords = await Promise.all(
      employeesData.map(async (employee) => ({
        ...employee,
        password: await hashValue(employee.password)
      }))
    )

    const createdEmployees = await EmployeeModel.insertMany(employeesWithHashedPasswords)
    const employeeIds = createdEmployees.map((e) => e._id as mongoose.Types.ObjectId)
    console.log(`✅ Created ${createdEmployees.length} employees`)

    // Create Shifts
    console.log('⏰ Creating shifts...')
    const shiftsData = getShiftsData(branchIds)
    const createdShifts = await ShiftModel.insertMany(shiftsData)
    const shiftIds = createdShifts.map((s) => s._id as mongoose.Types.ObjectId)
    console.log(`✅ Created ${createdShifts.length} shifts`)

    // Create Shift Registrations
    console.log('📝 Creating shift registrations...')
    const registrationsData = getShiftRegistrations(employeeIds, shiftIds)
    const createdRegistrations = await ShiftRegistrationModel.insertMany(registrationsData)
    console.log(`✅ Created ${createdRegistrations.length} shift registrations`)

    // Create Attendance Records
    console.log('✅ Creating attendance records...')
    const branchLocations = branches.map((b) => ({
      latitude: b.location.latitude,
      longitude: b.location.longitude
    }))
    const attendanceData = getAttendanceData(
      createdRegistrations as unknown as Array<{
        _id: mongoose.Types.ObjectId
        employeeId: mongoose.Types.ObjectId
        shiftId: mongoose.Types.ObjectId
        date: Date
        status: string
      }>,
      branchLocations
    )
    const createdAttendance = await AttendanceModel.insertMany(attendanceData)
    console.log(`✅ Created ${createdAttendance.length} attendance records`)

    // Create Messages
    console.log('💬 Creating messages...')
    const messagesData = getMessagesData(employeeIds, branchIds)
    const createdMessages = await MessageModel.insertMany(messagesData)
    console.log(`✅ Created ${createdMessages.length} messages`)

    // Create Notifications
    console.log('🔔 Creating notifications...')
    const notificationsData = getNotificationsData(employeeIds)
    const createdNotifications = await NotificationModel.insertMany(notificationsData)
    console.log(`✅ Created ${createdNotifications.length} notifications`)

    // Summary
    console.log('\n📊 Seeding Summary:')
    console.log('='.repeat(50))
    console.log(`Branches: ${createdBranches.length}`)
    console.log(`Employees: ${createdEmployees.length}`)
    console.log(`  - Admins: 2`)
    console.log(`  - Managers: 4`)
    console.log(`  - Employees: ${createdEmployees.length - 6}`)
    console.log(`Shifts: ${createdShifts.length}`)
    console.log(`Shift Registrations: ${createdRegistrations.length}`)
    console.log(`Attendance Records: ${createdAttendance.length}`)
    console.log(`Messages: ${createdMessages.length}`)
    console.log(`Notifications: ${createdNotifications.length}`)
    console.log('='.repeat(50))

    console.log('\n🔐 Login Credentials:')
    console.log('='.repeat(50))
    console.log('Admin:')
    console.log('  Email: admin@ems.com')
    console.log('  Password: Admin@123')
    console.log('\nManager (Head Office):')
    console.log('  Email: michael.manager@ems.com')
    console.log('  Password: Manager@123')
    console.log('\nEmployee:')
    console.log('  Email: alice.johnson@ems.com')
    console.log('  Password: Employee@123')
    console.log('='.repeat(50))

    console.log('\n✨ Seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  }
}

// Run the seed function
seed()
