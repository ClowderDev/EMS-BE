import mongoose from 'mongoose'
import { config } from 'dotenv'
import EmployeeModel from '../models/employee.model'

config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ems'

async function verifyPasswordHashing() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB\n')

    // Get a sample of employees
    const employees = await EmployeeModel.find().limit(5).select('name email password role')

    console.log('📋 Sample Employee Password Hashes:')
    console.log('==================================================')

    employees.forEach((employee) => {
      const isHashed = employee.password.startsWith('$2') // bcrypt hashes start with $2a$ or $2b$
      console.log(`\n👤 ${employee.name} (${employee.role})`)
      console.log(`   Email: ${employee.email}`)
      console.log(`   Password: ${employee.password}`)
      console.log(`   ✓ Is Hashed: ${isHashed ? '✅ YES' : '❌ NO'}`)
    })

    console.log('\n==================================================')

    // Test login with one user
    console.log('\n🔐 Testing Password Comparison:')
    const testUser = await EmployeeModel.findOne({ email: 'admin@ems.com' })

    if (testUser) {
      const plainPassword = 'Admin@123'
      const isMatch = await testUser.comparePassword(plainPassword)
      console.log(`\nUser: ${testUser.name}`)
      console.log(`Plain Password: "${plainPassword}"`)
      console.log(`Stored Hash: ${testUser.password}`)
      console.log(`Match Result: ${isMatch ? '✅ CORRECT' : '❌ WRONG'}`)

      // Test wrong password
      const wrongMatch = await testUser.comparePassword('WrongPassword123')
      console.log(
        `\nWrong Password Test: ${wrongMatch ? '❌ FAILED (should be false)' : '✅ PASSED (correctly rejected)'}`
      )
    }

    console.log('\n✨ Verification completed!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  }
}

verifyPasswordHashing()
