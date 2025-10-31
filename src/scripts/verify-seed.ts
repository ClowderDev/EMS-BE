import mongoose from 'mongoose'
import { config } from 'dotenv'
import BranchModel from '../models/branch.model'
import EmployeeModel from '../models/employee.model'
import ShiftModel from '../models/shift.model'
import ShiftRegistrationModel from '../models/shift_registration.model'
import AttendanceModel from '../models/attendance.model'
import MessageModel from '../models/message.model'
import NotificationModel from '../models/notification.model'

// Load environment variables
config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ems'

interface CollectionCount {
  collection: string
  count: number
  expected: number
  status: string
}

async function verifySeededData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB\n')

    // Count documents in each collection
    const counts: CollectionCount[] = [
      {
        collection: 'Branches',
        count: await BranchModel.countDocuments(),
        expected: 4,
        status: ''
      },
      {
        collection: 'Employees',
        count: await EmployeeModel.countDocuments(),
        expected: 20,
        status: ''
      },
      {
        collection: 'Shifts',
        count: await ShiftModel.countDocuments(),
        expected: 9,
        status: ''
      },
      {
        collection: 'Shift Registrations',
        count: await ShiftRegistrationModel.countDocuments(),
        expected: 98,
        status: ''
      },
      {
        collection: 'Attendance Records',
        count: await AttendanceModel.countDocuments(),
        expected: 42,
        status: ''
      },
      {
        collection: 'Messages',
        count: await MessageModel.countDocuments(),
        expected: 10,
        status: ''
      },
      {
        collection: 'Notifications',
        count: await NotificationModel.countDocuments(),
        expected: 60,
        status: ''
      }
    ]

    // Determine status for each collection
    counts.forEach((item) => {
      if (item.count === item.expected) {
        item.status = '✅ Perfect'
      } else if (item.count >= item.expected * 0.9) {
        item.status = '⚠️ Close'
      } else if (item.count > 0) {
        item.status = '❌ Needs Reseed'
      } else {
        item.status = '❌ Empty'
      }
    })

    // Display results
    console.log('📊 Seed Data Verification Report')
    console.log('='.repeat(70))
    console.log(`${'Collection'.padEnd(25)} ${'Count'.padEnd(10)} ${'Expected'.padEnd(10)} ${'Status'.padEnd(15)}`)
    console.log('-'.repeat(70))

    counts.forEach((item) => {
      console.log(
        `${item.collection.padEnd(25)} ${String(item.count).padEnd(10)} ${String(item.expected).padEnd(10)} ${item.status}`
      )
    })

    console.log('='.repeat(70))

    // Overall status
    const allPerfect = counts.every((item) => item.count === item.expected)
    const hasData = counts.every((item) => item.count > 0)

    console.log('\n📈 Overall Status:')
    if (allPerfect) {
      console.log('✅ All collections have perfect seed data!')
    } else if (hasData) {
      console.log('⚠️ All collections have data, but some counts are off.')
      console.log('   Consider running: npm run seed')
    } else {
      console.log('❌ Some collections are empty. Please run: npm run seed')
    }

    // Test sample queries
    console.log('\n🔍 Sample Data Checks:')
    console.log('-'.repeat(70))

    // Check admin user
    const admin = await EmployeeModel.findOne({ email: 'admin@ems.com' })
    console.log(`Admin user exists: ${admin ? '✅ Yes' : '❌ No'} ${admin ? `(${admin.name})` : ''}`)

    // Check role distribution
    const roleStats = await EmployeeModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ])
    console.log('\nRole Distribution:')
    roleStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count}`)
    })

    // Check attendance status distribution
    const attendanceStats = await AttendanceModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
    console.log('\nAttendance Status:')
    attendanceStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count}`)
    })

    // Check unread notifications
    const unreadNotifications = await NotificationModel.countDocuments({ status: 'unread' })
    console.log(`\nUnread Notifications: ${unreadNotifications}`)

    // Check pending shift registrations
    const pendingRegistrations = await ShiftRegistrationModel.countDocuments({ status: 'pending' })
    console.log(`Pending Shift Registrations: ${pendingRegistrations}`)

    console.log('\n' + '='.repeat(70))
    console.log('✅ Verification completed!\n')
  } catch (error) {
    console.error('❌ Error verifying seed data:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  }
}

// Run verification
verifySeededData()
