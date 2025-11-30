# 🏗️ EMS Backend - Complete Architecture Documentation

**Employee Management System (EMS) - Backend Documentation for Developers**

Version: 1.0.0
Last Updated: November 7, 2025
Production URL: https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Configuration & Environment](#configuration--environment)
6. [Database Architecture](#database-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [API Design](#api-design)
9. [Real-time Features](#real-time-features)
10. [Error Handling](#error-handling)
11. [Middleware Pipeline](#middleware-pipeline)
12. [Security Implementation](#security-implementation)
13. [Deployment](#deployment)
14. [Development Workflow](#development-workflow)

---

## 🎯 Project Overview

### Purpose

The Employee Management System (EMS) backend is a comprehensive REST API built with Node.js, Express, and TypeScript. It provides complete employee lifecycle management including attendance tracking, shift scheduling, payroll management, real-time messaging, and notifications.

### Key Features

- **User Management**: Multi-role authentication (Admin, Manager, Employee)
- **Attendance System**: GPS-based check-in/check-out with geofencing
- **Shift Management**: Dynamic shift scheduling and registration
- **Payroll Processing**: Automated payroll calculations based on attendance
- **Violation Tracking**: Employee violation recording and management
- **Real-time Communication**: Socket.IO-based messaging and notifications
- **Report Generation**: PDF and CSV export capabilities
- **Email Notifications**: Automated email system with verification

### Business Rules

1. **Employees must check-in within branch geofence** (configurable radius)
2. **Attendance status automatically calculated**: Present, Late, Absent, Half-Day
3. **Shift registration required before attendance**
4. **Role-based access control**: Admin > Manager > Employee
5. **Email verification required for new users**
6. **JWT token-based authentication** with refresh token mechanism

---

## 💻 Technology Stack

### Core Technologies

```json
{
  "runtime": "Node.js (v18+)",
  "language": "TypeScript (v5.9.2)",
  "framework": "Express (v5.1.0)",
  "database": "MongoDB (Mongoose v8.18.1)",
  "realtime": "Socket.IO (v4.8.1)"
}
```

### Dependencies

#### Production Dependencies

| Package         | Version | Purpose                 |
| --------------- | ------- | ----------------------- |
| `express`       | ^5.1.0  | Web framework           |
| `mongoose`      | ^8.18.1 | MongoDB ODM             |
| `typescript`    | ^5.9.2  | Type safety             |
| `jsonwebtoken`  | ^9.0.2  | JWT authentication      |
| `bcrypt`        | ^6.0.0  | Password hashing        |
| `socket.io`     | ^4.8.1  | Real-time communication |
| `zod`           | ^4.1.11 | Schema validation       |
| `nodemailer`    | ^7.0.9  | Email service           |
| `pdfkit`        | ^0.17.2 | PDF generation          |
| `csv-writer`    | ^1.6.0  | CSV export              |
| `cors`          | ^2.8.5  | CORS handling           |
| `cookie-parser` | ^1.4.7  | Cookie parsing          |
| `dotenv`        | ^17.2.2 | Environment variables   |

#### Development Dependencies

| Package     | Version | Purpose                 |
| ----------- | ------- | ----------------------- |
| `nodemon`   | ^3.1.10 | Auto-restart dev server |
| `tsx`       | ^4.20.5 | TypeScript execution    |
| `eslint`    | ^9.35.0 | Code linting            |
| `prettier`  | ^3.6.2  | Code formatting         |
| `tsc-alias` | ^1.8.16 | Path alias resolution   |

---

## 📁 Project Structure

```
EMS-BE/
├── src/
│   ├── index.ts                    # Application entry point
│   ├── socket.ts                   # Socket.IO configuration
│   ├── type.d.ts                   # Global type definitions
│   │
│   ├── @types/                     # TypeScript type definitions
│   │   └── express.d.ts           # Extended Express types
│   │
│   ├── config/                     # Configuration files
│   │   ├── database.config.ts     # MongoDB connection
│   │   ├── env.config.ts          # Environment variables
│   │   └── http.config.ts         # HTTP server config
│   │
│   ├── controllers/                # Request handlers (Business logic entry)
│   │   ├── auth.controller.ts     # Authentication
│   │   ├── employee.controller.ts # Employee CRUD
│   │   ├── attendance.controller.ts
│   │   ├── branch.controller.ts
│   │   ├── shift.controller.ts
│   │   ├── shift-registration.controller.ts
│   │   ├── payroll.controller.ts
│   │   ├── violation.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── message.controller.ts
│   │   ├── user.controller.ts
│   │   └── report.controller.ts
│   │
│   ├── services/                   # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── employee.service.ts
│   │   ├── attendance.service.ts
│   │   ├── branch.service.ts
│   │   ├── shift.service.ts
│   │   ├── shift-registration.service.ts
│   │   ├── payroll.service.ts
│   │   ├── violation.service.ts
│   │   ├── notification.service.ts
│   │   ├── message.service.ts
│   │   ├── user.service.ts
│   │   └── report.service.ts
│   │
│   ├── models/                     # Mongoose schemas/models
│   │   ├── employee.model.ts
│   │   ├── attendance.model.ts
│   │   ├── branch.model.ts
│   │   ├── shift.model.ts
│   │   ├── shift_registration.model.ts
│   │   ├── payroll.model.ts
│   │   ├── violation.model.ts
│   │   ├── notification.model.ts
│   │   └── message.model.ts
│   │
│   ├── routes/                     # API route definitions
│   │   ├── index.route.ts         # Main router
│   │   ├── auth.route.ts
│   │   ├── employee.route.ts
│   │   ├── attendance.route.ts
│   │   ├── branch.route.ts
│   │   ├── shift.route.ts
│   │   ├── shift-registration.route.ts
│   │   ├── payroll.route.ts
│   │   ├── violation.route.ts
│   │   ├── notification.route.ts
│   │   ├── message.route.ts
│   │   ├── user.route.ts
│   │   └── report.route.ts
│   │
│   ├── middleware/                 # Express middleware
│   │   ├── auth.middleware.ts     # JWT verification
│   │   ├── role.middleware.ts     # Role-based access control
│   │   ├── errorHandler.middleware.ts
│   │   └── asyncHandler.middleware.ts
│   │
│   ├── validation/                 # Zod validation schemas
│   │   ├── auth.validator.ts
│   │   ├── employee.validator.ts
│   │   ├── attendance.validator.ts
│   │   ├── branch.validator.ts
│   │   ├── shift.validator.ts
│   │   ├── shift-registration.validator.ts
│   │   ├── payroll.validator.ts
│   │   ├── violation.validator.ts
│   │   ├── notification.validator.ts
│   │   ├── message.validator.ts
│   │   ├── user.validator.ts
│   │   └── report.validator.ts
│   │
│   ├── utils/                      # Utility functions
│   │   ├── app-error.ts           # Custom error class
│   │   ├── bcrypt.ts              # Password hashing
│   │   ├── email.ts               # Email service
│   │   └── get-env.ts             # Environment helper
│   │
│   ├── enums/                      # Enumerations
│   │   └── error-code.enum.ts     # Error code constants
│   │
│   └── scripts/                    # Utility scripts
│       ├── seed.ts                # Database seeding
│       ├── verify-seed.ts         # Verify seed data
│       └── verify-password-hash.ts
│
├── docs/                           # Documentation
│   ├── ANDROID_API_GUIDE.md
│   ├── FRONTEND_API_GUIDE.md
│   └── BACKEND_ARCHITECTURE.md    # This file
│
├── exports/                        # Generated reports (CSV/PDF)
│
├── .env                            # Environment variables (not in git)
├── .gitignore
├── package.json
├── tsconfig.json                   # TypeScript configuration
├── nodemon.json                    # Nodemon configuration
└── eslint.config.mts              # ESLint configuration
```

### Directory Purposes

| Directory      | Purpose                                             | Notes                            |
| -------------- | --------------------------------------------------- | -------------------------------- |
| `controllers/` | Handle HTTP requests, validate input, call services | Thin layer, no business logic    |
| `services/`    | Business logic implementation                       | Core application logic           |
| `models/`      | Database schemas and models                         | Mongoose models                  |
| `routes/`      | API endpoint definitions                            | Route registration               |
| `middleware/`  | Request preprocessing                               | Auth, validation, error handling |
| `validation/`  | Input validation schemas                            | Zod schemas                      |
| `utils/`       | Reusable helper functions                           | Pure functions                   |
| `config/`      | Configuration files                                 | Environment, DB, HTTP            |
| `enums/`       | Constants and enumerations                          | Error codes, statuses            |
| `scripts/`     | Maintenance and utility scripts                     | Seeding, testing                 |

---

## 🏛️ Architecture Patterns

### 1. Layered Architecture (MVC Variant)

```
┌─────────────────────────────────────────────┐
│          HTTP Request (Client)              │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  MIDDLEWARE LAYER                           │
│  - CORS                                     │
│  - Body Parser                              │
│  - Cookie Parser                            │
│  - Authentication (JWT)                     │
│  - Authorization (Role Check)               │
│  - Input Validation (Zod)                   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  ROUTE LAYER                                │
│  - Route definitions                        │
│  - HTTP method mapping                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  CONTROLLER LAYER                           │
│  - Request/Response handling                │
│  - Input extraction                         │
│  - Service orchestration                    │
│  - Response formatting                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  SERVICE LAYER (Business Logic)             │
│  - Core business rules                      │
│  - Data manipulation                        │
│  - External service calls                   │
│  - Transaction management                   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  MODEL LAYER (Data Access)                  │
│  - Database operations                      │
│  - Schema definitions                       │
│  - Data validation                          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│          MongoDB Database                    │
└─────────────────────────────────────────────┘
```

### 2. Request Flow Example

Let's trace a complete request: **POST /api/v1/attendance/check-in**

```typescript
// 1. CLIENT REQUEST
POST /api/v1/attendance/check-in
Headers: { Authorization: "Bearer <token>" }
Body: { latitude: 10.762622, longitude: 106.660172 }

// 2. MIDDLEWARE PIPELINE
┌──────────────────────────────────────────────────┐
│ cors() → Parse CORS headers                      │
│ express.json() → Parse JSON body                 │
│ authenticate() → Verify JWT token                │
│ asyncHandler() → Wrap for error handling         │
└──────────────────────────────────────────────────┘

// 3. ROUTE MATCHING
routes/attendance.route.ts:
  router.post('/check-in', authenticate, checkInController)

// 4. CONTROLLER
controllers/attendance.controller.ts:
  - Extract: latitude, longitude from req.body
  - Extract: employeeId from req.user (JWT payload)
  - Call: attendanceService.checkIn(employeeId, { latitude, longitude })
  - Return: { message: "Checked in successfully", data: attendance }

// 5. SERVICE (Business Logic)
services/attendance.service.ts:
  - Validate: Employee exists
  - Check: Employee has shift registration for today
  - Calculate: Distance from branch location (Haversine formula)
  - Validate: Employee is within geofence radius
  - Check: Not already checked in today
  - Create: New attendance record with status calculation
  - Return: Attendance document

// 6. MODEL (Database)
models/attendance.model.ts:
  - Insert document into "attendances" collection
  - Run pre-save hooks
  - Return created document

// 7. RESPONSE
{
  "message": "Checked in successfully",
  "data": {
    "_id": "...",
    "employeeId": "...",
    "checkIn": {
      "time": "2025-11-07T08:15:00Z",
      "location": { latitude: 10.762622, longitude: 106.660172 }
    },
    "status": "present"
  }
}
```

### 3. Design Patterns Used

#### a. **Dependency Injection** (Implicit)

```typescript
// Services are pure functions that receive dependencies
export const createEmployee = async (data: CreateEmployeeInput) => {
  // Uses imported models, utils
  const hashedPassword = await hashPassword(data.password)
  const employee = await EmployeeModel.create({ ...data, password: hashedPassword })
  return employee
}
```

#### b. **Repository Pattern** (via Mongoose Models)

```typescript
// Models act as repositories
const employee = await EmployeeModel.findById(id)
const employees = await EmployeeModel.find({ role: 'employee' })
```

#### c. **Factory Pattern** (Error Creation)

```typescript
// utils/app-error.ts
export class AppError extends Error {
  static badRequest(message: string) { ... }
  static unauthorized(message: string) { ... }
  static notFound(message: string) { ... }
}
```

#### d. **Middleware Chain Pattern**

```typescript
router.post(
  '/employees',
  authenticate, // Auth check
  authorize(['admin']), // Role check
  validate(schema), // Input validation
  asyncHandler(controller) // Error handling
)
```

#### e. **Observer Pattern** (Socket.IO Events)

```typescript
socket.on('send-message', async (data) => {
  // Handle event
  io.to(room).emit('new-message', message) // Notify observers
})
```

---

## ⚙️ Configuration & Environment

### Application Entry Point (`src/index.ts`)

```typescript
import express from 'express'
import { createServer } from 'http'
import connectDatabase from './config/database.config'
import routes from './routes/index.route'
import { initializeSocketIO } from './socket'
import { errorHandler } from './middleware/errorHandler.middleware'

const app = express()
const httpServer = createServer(app)

// 1. Connect to Database
connectDatabase()

// 2. Configure Middleware
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 3. Register Routes
app.use('/api/v1', routes)

// 4. 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// 5. Error Handler
app.use(errorHandler)

// 6. Initialize WebSocket
initializeSocketIO(httpServer)

// 7. Start Server
httpServer.listen(Env.PORT)
```

### Environment Variables (`src/config/env.config.ts`)

```typescript
export const Env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  FRONTEND_URL: process.env.FRONTEND_URL,

  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
}
```

**Required Environment Variables:**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ems

# Authentication
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRATION=1h

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Database Configuration (`src/config/database.config.ts`)

```typescript
import mongoose from 'mongoose'

const connectDatabase = async () => {
  try {
    await mongoose.connect(Env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000, // Wait 8s to select server
      socketTimeoutMS: 45000, // Close socket after 45s
      connectTimeoutMS: 10000 // Initial connection timeout
    })
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    process.exit(1) // Exit process on failure
  }
}
```

### CORS Configuration

```typescript
const corsOptions = {
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

---

## 🗄️ Database Architecture

### MongoDB Collections Overview

| Collection            | Purpose                    | Relationships                         |
| --------------------- | -------------------------- | ------------------------------------- |
| `employees`           | User accounts and profiles | Links to: branch, attendance, payroll |
| `branches`            | Company branch locations   | Referenced by: employees, shifts      |
| `shifts`              | Work shift definitions     | Links to: branch, shift_registrations |
| `shift_registrations` | Employee shift assignments | Links to: employee, shift             |
| `attendances`         | Daily attendance records   | Links to: employee, branch, shift     |
| `payrolls`            | Salary and payment records | Links to: employee                    |
| `violations`          | Employee violation logs    | Links to: employee                    |
| `notifications`       | System notifications       | Links to: sender, recipient           |
| `messages`            | Chat messages              | Links to: sender, receiver            |

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  EMPLOYEES  │──────>│  BRANCHES   │<──────│   SHIFTS    │
└──────┬──────┘       └─────────────┘       └──────┬──────┘
       │                                            │
       │                                            │
       ├────────────────────────────────────────────┤
       │                                            │
       ▼                                            ▼
┌─────────────────────────────────────────────────────┐
│          SHIFT_REGISTRATIONS                        │
│  (Many-to-Many: Employee <-> Shift)                 │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────┐
│   ATTENDANCES   │ ──> Daily check-in/out records
└─────────────────┘

┌─────────────┐
│  EMPLOYEES  │───────> PAYROLLS (One-to-Many)
└──────┬──────┘
       │
       └──────────────> VIOLATIONS (One-to-Many)

┌─────────────┐
│  EMPLOYEES  │───────> NOTIFICATIONS (Sender/Receiver)
└──────┬──────┘
       │
       └──────────────> MESSAGES (Sender/Receiver)
```

---

**This is Part 1 of the documentation covering:**

- ✅ Project Overview
- ✅ Technology Stack
- ✅ Project Structure
- ✅ Architecture Patterns
- ✅ Configuration & Environment
- ✅ Database Architecture (Overview)

---

---

## 📦 Database Models (Detailed Schemas)

### 1. Employee Model (`models/employee.model.ts`)

**Purpose**: Core user model for authentication and employee management

```typescript
interface EmployeeDocument {
  name: string // Full name
  username: string // Unique login identifier (lowercase)
  role: 'employee' | 'manager' | 'admin'
  branchId: ObjectId // Reference to Branch
  phone?: string // Optional contact
  email?: string // Optional, added by user after account creation
  password: string // Bcrypt hashed

  // Password Reset
  resetPasswordToken?: string
  resetPasswordExpires?: Date

  // Email Verification
  emailVerificationCode?: string // 6-digit code
  emailVerificationExpires?: Date // Expiry time (15 minutes)
  isEmailVerified: boolean // Email verification status

  // Timestamps
  createdAt: Date
  updatedAt: Date

  // Methods
  comparePassword: (password: string) => Promise<boolean>
  omitPassword: () => Omit<EmployeeDocument, 'password'>
}
```

**Schema Configuration:**

```typescript
{
  // Unique constraints
  username: { unique: true, lowercase: true }
  email: { unique: true, sparse: true }  // sparse allows multiple null values

  // Enums
  role: ['employee', 'manager', 'admin']

  // References
  branchId: { ref: 'Branch' }

  // Timestamps
  timestamps: true  // Auto-generates createdAt, updatedAt
}
```

**Pre-save Hook:**

```typescript
employeeSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashValue(this.password) // Bcrypt hash
  }
  next()
})
```

**Instance Methods:**

```typescript
// Compare password for login
comparePassword: async (password) => {
  return await compareValue(password, this.password)
}

// Remove password from response
omitPassword: () => {
  const { password, ...userWithoutPassword } = this.toObject()
  return userWithoutPassword
}
```

**Indexes:**

- `username`: Unique index for fast lookup
- `email`: Sparse unique index (allows null but enforces uniqueness)
- `branchId`: Index for branch-based queries

---

### 2. Branch Model (`models/branch.model.ts`)

**Purpose**: Store company branch/location information with geofencing

```typescript
interface BranchDocument {
  branchName: string
  address: string
  location?: {
    latitude: number // -90 to 90
    longitude: number // -180 to 180
    radius: number // Geofence radius in meters (10-10000)
  }
  createdAt: Date
  updatedAt: Date
}
```

**Geofencing Logic:**

```typescript
// Default radius: 500 meters
// Used for check-in validation
// Employee must be within this radius to check-in

location: {
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 },
  radius: { min: 10, max: 10000, default: 500 }
}
```

**Use Cases:**

- Employee assignment to specific branch
- Geofence validation during check-in/check-out
- Branch-based reporting and analytics
- Shift assignment per branch

---

### 3. Shift Model (`models/shift.model.ts`)

**Purpose**: Define work shifts with time ranges

```typescript
interface ShiftDocument {
  shiftName: string // e.g., "Morning Shift", "Night Shift"
  startTime: string // Format: "HH:mm" (e.g., "08:00")
  endTime: string // Format: "HH:mm" (e.g., "17:00")
  branchId: ObjectId // Reference to Branch
  maxEmployees?: number // Optional capacity limit
  description?: string // Optional notes
  createdAt: Date
  updatedAt: Date
}
```

**Time Format:**

```typescript
// Stored as strings in "HH:mm" format
startTime: '08:00' // 8:00 AM
endTime: '17:00' // 5:00 PM

// Converted to Date objects for calculations:
const shiftStart = new Date(`1970-01-01T${shift.startTime}:00Z`)
const shiftEnd = new Date(`1970-01-01T${shift.endTime}:00Z`)
```

**Business Rules:**

- Each shift belongs to ONE branch
- Employees must register for shifts before attendance
- Shift times are in 24-hour format
- Cross-midnight shifts supported (e.g., "22:00" to "06:00")

---

### 4. Attendance Model (`models/attendance.model.ts`)

**Purpose**: Track daily employee attendance with GPS verification

```typescript
interface AttendanceDocument {
  employeeId: ObjectId
  shiftId: ObjectId
  registrationId: ObjectId // Links to shift registration
  date: Date // Attendance date (normalized to midnight)

  checkInTime: Date | null
  checkOutTime: Date | null

  checkInLocation: {
    latitude: number
    longitude: number
  } | null

  checkOutLocation: {
    latitude: number
    longitude: number
  } | null

  status: 'checked-in' | 'checked-out' | 'absent'
  notes: string | null // Admin notes
  workHours: number | null // Calculated hours worked

  createdAt: Date
  updatedAt: Date

  // Methods
  calculateWorkHours: () => number | null
}
```

**Status Flow:**

```
absent → checked-in → checked-out
  ↑         ↓
  └─────────┘ (if employee doesn't check-out)
```

**Work Hours Calculation:**

```typescript
calculateWorkHours: function() {
  if (!this.checkInTime || !this.checkOutTime) return null

  const diff = this.checkOutTime.getTime() - this.checkInTime.getTime()
  return Math.round((diff / (1000 * 60 * 60)) * 100) / 100  // Hours with 2 decimals
}
```

**Geofence Validation:**

```typescript
// Check if employee is within branch radius
function isWithinGeofence(
  empLat: number,
  empLng: number,
  branchLat: number,
  branchLng: number,
  radius: number
): boolean {
  const distance = calculateDistance(empLat, empLng, branchLat, branchLng)
  return distance <= radius
}

// Haversine formula used for distance calculation
```

---

### 5. Shift Registration Model (`models/shift_registration.model.ts`)

**Purpose**: Link employees to shifts (Many-to-Many relationship)

```typescript
interface ShiftRegistrationDocument {
  employeeId: ObjectId
  shiftId: ObjectId
  startDate: Date // Registration start date
  endDate?: Date // Optional end date (null = ongoing)
  isActive: boolean // Can be deactivated without deletion
  createdAt: Date
  updatedAt: Date
}
```

**Business Logic:**

- Employee must be registered to a shift before checking in
- Registrations can be temporary (startDate → endDate)
- Permanent registrations have no endDate
- Can be deactivated without deletion for history

**Validation:**

```typescript
// Check if employee can check-in today
const hasActiveRegistration = await ShiftRegistration.findOne({
  employeeId,
  shiftId,
  isActive: true,
  startDate: { $lte: today },
  $or: [
    { endDate: null }, // Permanent
    { endDate: { $gte: today } } // Still valid
  ]
})
```

---

### 6. Payroll Model (`models/payroll.model.ts`)

**Purpose**: Track employee salary and payments

```typescript
interface PayrollDocument {
  employeeId: ObjectId
  month: number // 1-12
  year: number // e.g., 2025
  baseSalary: number // Base monthly salary
  allowances: number // Additional allowances
  deductions: number // Penalties, taxes, etc.
  totalSalary: number // Calculated: base + allowances - deductions
  status: 'pending' | 'paid' | 'cancelled'
  paidDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

**Calculation Logic:**

```typescript
totalSalary = baseSalary + allowances - deductions

// Allowances can include:
// - Attendance bonuses
// - Performance bonuses
// - Transportation

// Deductions can include:
// - Absences
// - Late arrivals
// - Violations
```

---

### 7. Violation Model (`models/violation.model.ts`)

**Purpose**: Record employee violations and disciplinary actions

```typescript
interface ViolationDocument {
  employeeId: ObjectId
  violationType: string // e.g., "Late Arrival", "Absence", "Misconduct"
  description: string // Details of violation
  date: Date // When violation occurred
  severity: 'minor' | 'major' | 'critical'
  action?: string // Action taken (warning, suspension, etc.)
  reportedBy: ObjectId // Manager/Admin who reported
  createdAt: Date
  updatedAt: Date
}
```

**Severity Levels:**

- `minor`: First-time offenses, warnings
- `major`: Repeated violations, financial penalties
- `critical`: Serious misconduct, may lead to termination

---

### 8. Notification Model (`models/notification.model.ts`)

**Purpose**: System notifications for users

```typescript
interface NotificationDocument {
  recipientId: ObjectId // Who receives notification
  senderId?: ObjectId // Who sent it (null for system)
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  isRead: boolean
  metadata?: any // Additional data (e.g., link, action)
  createdAt: Date
  updatedAt: Date
}
```

**Notification Types:**

- `info`: General information (shift assigned, payroll ready)
- `warning`: Attention needed (late check-in, missing check-out)
- `error`: Critical issues (violation recorded, account suspended)
- `success`: Positive feedback (bonus received, target achieved)

---

### 9. Message Model (`models/message.model.ts`)

**Purpose**: Direct messaging between users

```typescript
interface MessageDocument {
  senderId: ObjectId
  receiverId: ObjectId
  content: string
  isRead: boolean
  readAt?: Date
  deletedBy?: ObjectId[] // Soft delete per user
  createdAt: Date
  updatedAt: Date
}
```

**Features:**

- Direct 1-to-1 messaging
- Read receipts
- Soft delete (message hidden for specific users)
- Real-time delivery via Socket.IO

---

## 🔐 Authentication & Authorization

### JWT Token System

#### Access Token (Short-lived)

```typescript
interface AccessTokenPayload {
  employeeId: string // User ID
  email: string // User email (or username)
  role: string // User role
  iat: number // Issued at (timestamp)
  exp: number // Expires at (timestamp)
}

// Configuration
JWT_EXPIRATION = '1h' // Expires in 1 hour
```

#### Refresh Token (Long-lived)

```typescript
interface RefreshTokenPayload {
  employeeId: string
  email: string
  role: string
  iat: number
  exp: number
}

// Configuration
REFRESH_TOKEN_EXPIRATION = '7d' // Expires in 7 days
```

#### Token Generation Flow

```typescript
// 1. User logs in
POST /api/v1/auth/login
{ username: "admin", password: "Admin@123" }

// 2. Backend validates credentials
const employee = await EmployeeModel.findOne({ username })
const isValid = await employee.comparePassword(password)

// 3. Generate tokens
const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })
const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })

// 4. Return tokens
{
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: { ... }
}
```

#### Token Refresh Flow

```typescript
// 1. Access token expires
GET /api/v1/employees
Response: 401 Unauthorized { errorCode: "AUTH_INVALID_TOKEN" }

// 2. Client uses refresh token
POST /api/v1/auth/refresh-token
{ refreshToken: "..." }

// 3. Backend validates refresh token
const decoded = jwt.verify(refreshToken, JWT_SECRET)

// 4. Generate new access token
const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })

// 5. Return new token
{ accessToken: "new_token_here" }
```

---

### Authentication Middleware (`middleware/auth.middleware.ts`)

**Purpose**: Verify JWT token and attach user to request

```typescript
export const authMiddleware = async (req, res, next) => {
  // 1. Extract token from header
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access token is required',
      errorCode: 'AUTH_TOKEN_NOT_FOUND'
    })
  }

  const token = authHeader.substring(7) // Remove "Bearer "

  // 2. Verify token
  let payload
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: 'Access token has expired',
        errorCode: 'AUTH_INVALID_TOKEN'
      })
    }
    return res.status(401).json({
      message: 'Invalid access token',
      errorCode: 'AUTH_INVALID_TOKEN'
    })
  }

  // 3. Find employee
  const employee = await EmployeeModel.findById(payload.employeeId)
  if (!employee) {
    return res.status(401).json({
      message: 'Employee not found',
      errorCode: 'AUTH_USER_NOT_FOUND'
    })
  }

  // 4. Attach user to request
  req.user = employee
  next()
}
```

**Usage:**

```typescript
// Protect route with authentication
router.get('/employees', authMiddleware, getEmployees)
```

---

### Role-Based Access Control (`middleware/role.middleware.ts`)

**Role Hierarchy:**

```
admin > manager > employee

admin:    Full access to all resources
manager:  Branch-level access (their branch only)
employee: Personal data access only
```

**Implementation:**

```typescript
export const requireRole = (allowedRoles: Role[]) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
        errorCode: 'AUTH_USER_NOT_FOUND'
      })
    }

    const userRole = req.user.role

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        errorCode: 'ACCESS_UNAUTHORIZED'
      })
    }

    next()
  }
}

// Convenience functions
export const adminOnly = requireRole(['admin'])
export const adminOrManager = requireRole(['admin', 'manager'])
export const authenticatedOnly = requireRole(['admin', 'manager', 'employee'])
```

**Usage Examples:**

```typescript
// Only admins can create employees
router.post('/employees', authMiddleware, adminOnly, createEmployee)

// Admins and managers can view all employees
router.get('/employees', authMiddleware, adminOrManager, getAllEmployees)

// All authenticated users can view their own profile
router.get('/profile', authMiddleware, authenticatedOnly, getProfile)
```

---

## 🔄 Middleware Pipeline

### Request Processing Flow

```
┌─────────────────────────────────────────────────┐
│  1. CORS Middleware                             │
│     - Validate origin                           │
│     - Set CORS headers                          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  2. Body Parsers                                │
│     - express.json()                            │
│     - express.urlencoded()                      │
│     - cookie-parser                             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  3. Route Matching                              │
│     - Match HTTP method + path                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  4. Authentication (authMiddleware)             │
│     - Verify JWT token                          │
│     - Load user from database                   │
│     - Attach user to req.user                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  5. Authorization (requireRole)                 │
│     - Check user role                           │
│     - Validate permissions                      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  6. Input Validation (Zod schemas)              │
│     - Validate request body/params/query        │
│     - Transform data types                      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  7. Async Handler Wrapper                       │
│     - Catch async errors                        │
│     - Pass to error handler                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  8. Controller Execution                        │
│     - Extract request data                      │
│     - Call service layer                        │
│     - Format response                           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  9. Response or Error                           │
│     - Success: Return JSON response             │
│     - Error: Pass to error handler              │
└─────────────────────────────────────────────────┘
```

### Async Handler Wrapper (`middleware/asyncHandler.middleware.ts`)

```typescript
export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Usage
router.post(
  '/employees',
  asyncHandler(async (req, res) => {
    const employee = await createEmployee(req.body)
    res.json({ data: employee })
  })
)
```

**Benefits:**

- Eliminates try-catch blocks in controllers
- Automatically passes errors to error handler
- Cleaner controller code

---

## ⚠️ Error Handling Strategy

### Custom Error Classes (`utils/app-error.ts`)

```typescript
// Base error class
export class AppError extends Error {
  statusCode: number
  errorCode?: string

  constructor(message, statusCode, errorCode) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}

// Specific error classes
export class NotFoundException extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'RESOURCE_NOT_FOUND')
  }
}

export class BadRequestException extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'ACCESS_UNAUTHORIZED')
  }
}

export class ForbiddenException extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'ACCESS_UNAUTHORIZED')
  }
}
```

### Error Codes (`enums/error-code.enum.ts`)

```typescript
export const ErrorCodeEnum = {
  // Authentication
  AUTH_TOKEN_NOT_FOUND: 'AUTH_TOKEN_NOT_FOUND',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',

  // Authorization
  ACCESS_UNAUTHORIZED: 'ACCESS_UNAUTHORIZED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // System
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const
```

### Global Error Handler (`middleware/errorHandler.middleware.ts`)

```typescript
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log('Error on PATH:', req.path, 'Error:', error)

  // 1. JSON Parse Errors
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Invalid JSON format',
      error: error.message,
      errorCode: 'VALIDATION_ERROR'
    })
  }

  // 2. Zod Validation Errors
  if (error instanceof ZodError) {
    const errors = error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message
    }))
    return res.status(400).json({
      message: 'Validation failed',
      errors,
      errorCode: 'VALIDATION_ERROR'
    })
  }

  // 3. Mongoose Validation Errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message
    }))
    return res.status(400).json({
      message: 'Validation failed',
      errors,
      errorCode: 'VALIDATION_ERROR'
    })
  }

  // 4. Custom AppError
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode
    })
  }

  // 5. Unknown Errors
  return res.status(500).json({
    message: 'Internal Server Error',
    error: error.message
  })
}
```

### Error Response Format

```json
// Validation Error
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "errorCode": "VALIDATION_ERROR"
}

// Authentication Error
{
  "message": "Access token has expired",
  "errorCode": "AUTH_INVALID_TOKEN"
}

// Authorization Error
{
  "message": "Access denied. Required role: admin or manager",
  "errorCode": "ACCESS_UNAUTHORIZED"
}

// Not Found Error
{
  "message": "Employee not found",
  "errorCode": "RESOURCE_NOT_FOUND"
}
```

### Throwing Errors in Services

```typescript
// Example: Employee Service
export const getEmployeeById = async (id: string) => {
  const employee = await EmployeeModel.findById(id)

  if (!employee) {
    throw new NotFoundException(`Employee with ID ${id} not found`)
  }

  return employee
}

// Example: Attendance Service with business logic error
export const checkIn = async (employeeId: string, location: Location) => {
  // Check if already checked in
  const existingAttendance = await AttendanceModel.findOne({
    employeeId,
    date: today,
    checkInTime: { $ne: null }
  })

  if (existingAttendance) {
    throw new BadRequestException('Already checked in today')
  }

  // Check geofence
  const distance = calculateDistance(location, branchLocation)
  if (distance > branch.location.radius) {
    throw new BadRequestException(
      `You are ${distance}m away from the branch. Must be within ${branch.location.radius}m to check in`
    )
  }

  // Create attendance
  return await AttendanceModel.create({ ... })
}
```

---

**This is Part 2 of the documentation covering:**

- ✅ Database Models (All 9 models with detailed schemas)
- ✅ Authentication & Authorization System (JWT, tokens, role-based access)
- ✅ Middleware Pipeline (Request flow, async handler)
- ✅ Error Handling Strategy (Custom errors, error codes, global handler)

---

---

## 🔧 Services Layer (Business Logic)

The service layer contains the core business logic, separated from HTTP concerns. Each service handles one domain (e.g., attendance, auth, employees).

### Service Architecture Pattern

```typescript
// All services follow this pattern:
export const serviceName = async (data: ValidatedInput, user?: RequestUser) => {
  // 1. Validate business rules
  // 2. Check permissions
  // 3. Interact with database
  // 4. Apply calculations/transformations
  // 5. Return result (throw error if failure)
}
```

---

### 1. Authentication Service (`services/auth.service.ts`)

**Purpose**: Handle user authentication, registration, email verification

#### Register Service

```typescript
export const registerService = async (body: RegisterSchemaType) => {
  const { email, branchId, name, password, role } = body
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // 1. Check if user exists
      const existingUser = await EmployeeModel.findOne({ email }).session(session)
      if (existingUser) {
        throw new BadRequestException('User already exists with this email')
      }

      // 2. Generate 6-digit verification code
      const verificationCode = generateVerificationCode() // Random 6 digits
      const verificationExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 min

      // 3. Create user
      const newUser = new EmployeeModel({
        name,
        email,
        password, // Will be hashed by pre-save hook
        role,
        branchId: new mongoose.Types.ObjectId(branchId),
        emailVerificationCode: verificationCode,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false
      })

      await newUser.save({ session })

      // 4. Send verification email
      if (newUser.email) {
        await sendVerificationEmail(newUser.email, newUser.name, verificationCode)
      }

      return {
        user: newUser.omitPassword(),
        message: 'Registration successful. Check email for verification code.'
      }
    })
  } finally {
    await session.endSession()
  }
}
```

#### Login Service

```typescript
export const loginService = async (body: LoginSchemaType, res: Response) => {
  const { email, password } = body
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // 1. Find user by email OR username
      const user = await EmployeeModel.findOne({
        $or: [{ email }, { username: email }]
      }).session(session)

      if (!user) {
        throw new BadRequestException('Invalid credentials')
      }

      // 2. Verify password
      const isValid = await user.comparePassword(password)
      if (!isValid) {
        throw new BadRequestException('Invalid credentials')
      }

      // 3. Generate JWT tokens
      const { accessToken, refreshToken } = generateToken(user.id, user.email || user.username, user.role)

      // 4. Set cookies
      await setToken(res, accessToken, refreshToken)

      // 5. Return user and tokens
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
```

**Key Functions:**

```typescript
// Generate 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate JWT tokens
function generateToken(employeeId: string, email: string, role: string) {
  const accessToken = jwt.sign({ employeeId, email, role }, process.env.JWT_SECRET!, { expiresIn: '60m' })
  const refreshToken = jwt.sign({ employeeId, email, role }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

// Set HTTP-only cookies
async function setToken(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, {
    httpOnly: true, // Prevent XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 60 * 60 * 1000 // 1 hour
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
}
```

---

### 2. Attendance Service (`services/attendance.service.ts`)

**Purpose**: Handle check-in, check-out with GPS validation and business rules

#### Check-In Service (Complex Business Logic)

```typescript
export const checkIn = async (data: CheckInSchemaType, requestUser: RequestUser) => {
  const { registrationId, latitude, longitude, notes } = data
  const employeeIdStr = String(requestUser._id)

  // 1. Validate shift registration
  const registration = await ShiftRegistrationModel.findById(registrationId).populate('shiftId').populate('employeeId')

  if (!registration) {
    throw new NotFoundException('Shift registration not found')
  }

  if (registration.status !== 'approved') {
    throw new BadRequestException('Only approved registrations can be used')
  }

  // 2. Verify ownership
  if (registration.employeeId._id.toString() !== employeeIdStr) {
    throw new ForbiddenException('Can only check-in for your own shifts')
  }

  // 3. Validate date (must be today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const regDate = new Date(registration.date)
  regDate.setHours(0, 0, 0, 0)

  if (today.getTime() !== regDate.getTime()) {
    throw new BadRequestException(`This registration is for ${regDate.toLocaleDateString()}, not today`)
  }

  // 4. Check for existing check-in
  const existingAttendance = await AttendanceModel.findOne({
    registrationId: new mongoose.Types.ObjectId(registrationId),
    date: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lt: new Date(today.setHours(23, 59, 59, 999))
    }
  })

  if (existingAttendance) {
    throw new BadRequestException('Already checked in for this shift today')
  }

  // 5. GPS VALIDATION (Geofencing)
  const shift = await ShiftModel.findById(registration.shiftId)
  const branch = await BranchModel.findById(shift.branchId)

  if (branch.location) {
    const distance = calculateDistance(latitude, longitude, branch.location.latitude, branch.location.longitude)

    const maxDistanceKm = (branch.location.radius || 500) / 1000

    if (distance > maxDistanceKm) {
      throw new BadRequestException(
        `Must be within ${branch.location.radius}m of branch. ` + `Current distance: ${Math.round(distance * 1000)}m`
      )
    }
  }

  // 6. Time validation (allow 30 min early)
  const now = new Date()
  const [shiftStartHour, shiftStartMin] = shift.startTime.split(':').map(Number)
  const shiftStart = new Date()
  shiftStart.setHours(shiftStartHour, shiftStartMin, 0, 0)
  const earliestCheckIn = new Date(shiftStart.getTime() - 30 * 60 * 1000)

  if (now < earliestCheckIn) {
    throw new BadRequestException(`Check-in allowed from ${earliestCheckIn.toLocaleTimeString()} onwards`)
  }

  // 7. Create attendance record
  const attendance = new AttendanceModel({
    employeeId: new mongoose.Types.ObjectId(employeeIdStr),
    shiftId: registration.shiftId,
    registrationId: new mongoose.Types.ObjectId(registrationId),
    date: today,
    checkInTime: now,
    checkInLocation: { latitude, longitude },
    status: 'checked-in',
    notes
  })

  await attendance.save()

  // 8. Populate and return
  await attendance.populate([
    { path: 'employeeId', select: 'name email role' },
    { path: 'shiftId', select: 'shiftName startTime endTime' },
    { path: 'registrationId' }
  ])

  return attendance.toObject()
}
```

**Helper Function: Haversine Distance**

```typescript
// Calculate distance between two GPS coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}
```

**Business Rules Enforced:**

1. ✅ Must have approved shift registration
2. ✅ Can only check-in for own shifts
3. ✅ Must check-in on registration date
4. ✅ Cannot check-in twice same day
5. ✅ Must be within branch geofence radius
6. ✅ Can check-in up to 30 minutes before shift

---

## 🎮 Controllers Layer (HTTP Request Handlers)

Controllers are thin layers that handle HTTP requests/responses. They extract data, call services, and format responses.

### Controller Pattern

```typescript
export const controllerName = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate input with Zod
  const validatedData = schema.parse(req.body)

  // 2. Call service
  const result = await service(validatedData, req.user)

  // 3. Return formatted response
  return res.status(HTTPSTATUS.OK).json({
    message: 'Success message',
    data: result
  })
})
```

---

### Authentication Controllers (`controllers/auth.controller.ts`)

```typescript
export const loginController = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate input
  const body = loginSchema.parse(req.body)

  // 2. Call service
  const result = await loginService(body, res)

  // 3. Return response
  return res.status(HTTPSTATUS.OK).json({
    message: 'User logged in successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  })
})

export const refreshTokenController = asyncHandler(async (req: Request, res: Response) => {
  // Get refresh token from cookie or body
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken

  if (!refreshToken) {
    throw new BadRequestException('Refresh token is required')
  }

  const result = await refreshTokenService(refreshToken, res)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Token refreshed successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  })
})

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  // Clear cookies
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')

  return res.status(HTTPSTATUS.OK).json({
    message: 'User logged out successfully'
  })
})
```

---

### Attendance Controllers (`controllers/attendance.controller.ts`)

```typescript
export const checkInController = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate
  const validatedData = checkInSchema.parse(req.body)

  // 2. Call service (pass authenticated user)
  const result = await checkIn(validatedData, req.user!)

  // 3. Return
  return res.status(HTTPSTATUS.CREATED).json({
    message: 'Checked in successfully',
    data: result
  })
})

export const checkOutController = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = checkOutSchema.parse(req.body)
  const result = await checkOut(validatedData, req.user!)

  return res.status(HTTPSTATUS.OK).json({
    message: 'Checked out successfully',
    data: result
  })
})

export const getAttendancesController = asyncHandler(async (req: Request, res: Response) => {
  // Query params validated
  const validatedQuery = getAttendancesQuerySchema.parse(req.query)
  const result = await getAttendances(validatedQuery, req.user!)

  // Return with pagination
  return res.status(HTTPSTATUS.OK).json({
    message: 'Get attendances successfully',
    data: result.attendances,
    pagination: result.pagination
  })
})
```

**Response Format:**

```json
// Success Response
{
  "message": "Checked in successfully",
  "data": {
    "_id": "...",
    "employeeId": { "name": "John", "email": "john@example.com" },
    "checkInTime": "2025-11-07T08:15:00Z",
    "checkInLocation": { "latitude": 10.762622, "longitude": 106.660172 },
    "status": "checked-in"
  }
}

// Paginated Response
{
  "message": "Get attendances successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "limit": 10
  }
}
```

---

## ✅ Validation Layer (Zod Schemas)

All input validation is done using Zod schemas. This provides type safety and automatic validation.

### Why Zod?

- ✅ Type-safe validation
- ✅ Automatic TypeScript types
- ✅ Clear error messages
- ✅ Composable schemas
- ✅ Transformation support

---

### Authentication Validators (`validation/auth.validator.ts`)

```typescript
import { z } from 'zod'

// Register schema
export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  branchId: z.string().min(1, 'Branch ID is required'),
  role: z.enum(['employee', 'manager', 'admin'], {
    message: 'Role must be one of: employee, manager, admin'
  })
})

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

// Email verification schema
export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits')
})

// Export TypeScript types
export type RegisterSchemaType = z.infer<typeof registerSchema>
export type LoginSchemaType = z.infer<typeof loginSchema>
export type VerifyEmailSchemaType = z.infer<typeof verifyEmailSchema>
```

---

### Attendance Validators (`validation/attendance.validator.ts`)

```typescript
import { z } from 'zod'

// Check-in schema
export const checkInSchema = z.object({
  registrationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid registration ID format'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  notes: z.string().max(500, 'Notes is too long').optional()
})

// Check-out schema
export const checkOutSchema = z.object({
  attendanceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  notes: z.string().max(500).optional()
})

// Query params schema
export const getAttendancesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(['checked-in', 'checked-out', 'absent']).optional(),
  employeeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  shiftId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  startDate: z.string().optional(), // ISO date
  endDate: z.string().optional(),
  sortBy: z.enum(['date', 'checkInTime', 'checkOutTime', 'workHours']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc')
})

// Export types
export type CheckInSchemaType = z.infer<typeof checkInSchema>
export type CheckOutSchemaType = z.infer<typeof checkOutSchema>
export type GetAttendancesQuerySchemaType = z.infer<typeof getAttendancesQuerySchema>
```

**Key Features:**

```typescript
// Coercion (string → number for query params)
page: z.coerce.number().int().positive().default(1)

// Regex validation (MongoDB ObjectId)
z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')

// Enum validation
status: z.enum(['checked-in', 'checked-out', 'absent'])

// Range validation
latitude: z.number().min(-90).max(90)

// Optional with default
sortBy: z.enum([...]).default('date')
```

---

## 🔴 Socket.IO Real-time Features

The application uses Socket.IO for real-time communication (messaging, notifications, online status).

### Socket.IO Architecture

```
┌─────────────────────────────────────────────────┐
│  Client connects with JWT token                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Authentication Middleware                      │
│  - Verify JWT token                             │
│  - Load user info                               │
│  - Attach to socket.user                        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Connection Event                               │
│  - Add to onlineUsers map                       │
│  - Join branch room                             │
│  - Emit online status                           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Event Handlers                                 │
│  - direct:message                               │
│  - group:message                                │
│  - typing indicators                            │
│  - read receipts                                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Disconnect Event                               │
│  - Remove from onlineUsers                      │
│  - Emit offline status                          │
└─────────────────────────────────────────────────┘
```

---

### Socket.IO Implementation (`socket.ts`)

```typescript
import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import EmployeeModel from './models/employee.model'
import * as messageService from './services/message.service'

interface SocketUser {
  userId: string
  branchId: string
  name: string
  role: string
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser
}

// Store online users: userId → socketId
const onlineUsers = new Map<string, string>()

// Store user rooms
const userRooms = new Map<string, string>()

export const initializeSocketIO = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // ========== AUTHENTICATION MIDDLEWARE ==========
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Get token from handshake
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]

      if (!token) {
        return next(new Error('Authentication token required'))
      }

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      const userId = decoded.employeeId || decoded.userId

      // Get user from database
      const user = await EmployeeModel.findById(userId).select('name email role branchId').lean()

      if (!user) {
        return next(new Error('User not found'))
      }

      // Attach to socket
      socket.user = {
        userId: String(user._id),
        branchId: String(user.branchId),
        name: user.name,
        role: user.role
      }

      next()
    } catch {
      next(new Error('Invalid authentication token'))
    }
  })

  // ========== CONNECTION EVENT ==========
  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user!
    console.log(`✅ User connected: ${user.name} (${user.userId})`)

    // Add to online users
    onlineUsers.set(user.userId, socket.id)

    // Join branch room for group chat
    const branchRoom = `branch:${user.branchId}`
    socket.join(branchRoom)

    // Notify branch of new online user
    io.to(branchRoom).emit('user:online', {
      userId: user.userId,
      name: user.name,
      role: user.role
    })

    // Send online users list
    const branchOnlineUsers = Array.from(onlineUsers.entries())
      .filter(([userId]) => {
        const socket = io.sockets.sockets.get(onlineUsers.get(userId)!)
        return socket?.user?.branchId === user.branchId
      })
      .map(([userId]) => userId)

    io.to(branchRoom).emit('online:users', branchOnlineUsers)

    // ========== DIRECT MESSAGE EVENTS ==========

    /**
     * Join direct chat room
     */
    socket.on('direct:join', ({ userId: otherUserId }) => {
      const roomName = [user.userId, otherUserId].sort().join(':')
      socket.join(roomName)
      userRooms.set(user.userId, roomName)
      console.log(`💬 ${user.name} joined direct chat with ${otherUserId}`)
    })

    /**
     * Send direct message
     */
    socket.on('direct:message', async (data: { receiverId: string; content: string }) => {
      try {
        const { receiverId, content } = data

        // Save to database
        const message = await messageService.sendDirectMessage({
          senderId: user.userId,
          receiverId,
          branchId: user.branchId,
          content
        })

        // Emit to receiver (if online)
        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('direct:message:received', message)
        }

        // Confirm to sender
        socket.emit('direct:message:sent', message)
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    /**
     * Typing indicator
     */
    socket.on('direct:typing', ({ receiverId, isTyping }) => {
      const receiverSocketId = onlineUsers.get(receiverId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('direct:typing', {
          senderId: user.userId,
          senderName: user.name,
          isTyping
        })
      }
    })

    // ========== GROUP MESSAGE EVENTS ==========

    /**
     * Send group message to branch
     */
    socket.on('group:message', async (data: { content: string }) => {
      try {
        const { content } = data

        // Save to database
        const message = await messageService.sendGroupMessage({
          senderId: user.userId,
          branchId: user.branchId,
          content
        })

        // Broadcast to entire branch
        io.to(branchRoom).emit('group:message:received', message)
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    /**
     * Group typing indicator
     */
    socket.on('group:typing', ({ isTyping }) => {
      socket.to(branchRoom).emit('group:typing', {
        senderId: user.userId,
        senderName: user.name,
        isTyping
      })
    })

    // ========== READ RECEIPTS ==========

    socket.on('direct:mark-read', async ({ senderId }) => {
      try {
        await messageService.markDirectMessagesAsRead(user.userId, senderId)

        // Notify sender
        const senderSocketId = onlineUsers.get(senderId)
        if (senderSocketId) {
          io.to(senderSocketId).emit('direct:messages-read', {
            readBy: user.userId,
            readByName: user.name
          })
        }
      } catch (error) {
        socket.emit('error', { message: (error as Error).message })
      }
    })

    // ========== DISCONNECT EVENT ==========

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${user.name}`)

      // Remove from maps
      onlineUsers.delete(user.userId)
      userRooms.delete(user.userId)

      // Notify branch
      io.to(branchRoom).emit('user:offline', {
        userId: user.userId,
        name: user.name
      })

      // Update online users list
      const branchOnlineUsers = Array.from(onlineUsers.entries())
        .filter(([userId]) => {
          const socket = io.sockets.sockets.get(onlineUsers.get(userId)!)
          return socket?.user?.branchId === user.branchId
        })
        .map(([userId]) => userId)

      io.to(branchRoom).emit('online:users', branchOnlineUsers)
    })
  })

  console.log('🚀 Socket.IO server initialized')
  return io
}

export { onlineUsers }
```

---

### Socket.IO Events Reference

| Event                     | Direction       | Data                               | Description               |
| ------------------------- | --------------- | ---------------------------------- | ------------------------- |
| **Connection**            |                 |                                    |                           |
| `connect`                 | Server → Client | -                                  | Connection established    |
| `user:online`             | Server → Branch | `{userId, name, role}`             | User came online          |
| `user:offline`            | Server → Branch | `{userId, name}`                   | User went offline         |
| `online:users`            | Server → Branch | `string[]`                         | List of online user IDs   |
| **Direct Messages**       |                 |                                    |                           |
| `direct:join`             | Client → Server | `{userId}`                         | Join 1-on-1 chat          |
| `direct:message`          | Client → Server | `{receiverId, content}`            | Send direct message       |
| `direct:message:received` | Server → Client | `Message`                          | New message received      |
| `direct:message:sent`     | Server → Client | `Message`                          | Message sent confirmation |
| `direct:typing`           | Client → Server | `{receiverId, isTyping}`           | Typing indicator          |
| `direct:typing`           | Server → Client | `{senderId, senderName, isTyping}` | User is typing            |
| `direct:mark-read`        | Client → Server | `{senderId}`                       | Mark messages as read     |
| `direct:messages-read`    | Server → Client | `{readBy, readByName}`             | Messages were read        |
| **Group Messages**        |                 |                                    |                           |
| `group:message`           | Client → Server | `{content}`                        | Send to branch            |
| `group:message:received`  | Server → Branch | `Message`                          | New group message         |
| `group:typing`            | Client → Server | `{isTyping}`                       | Typing in group           |
| `group:typing`            | Server → Branch | `{senderId, senderName, isTyping}` | User typing in group      |
| **Errors**                |                 |                                    |                           |
| `error`                   | Server → Client | `{message}`                        | Error occurred            |

---

### Client Usage Example

```typescript
// Frontend connection
import io from 'socket.io-client'

const token = localStorage.getItem('accessToken')

const socket = io('https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net', {
  auth: { token }
})

// Listen for connection
socket.on('connect', () => {
  console.log('Connected to Socket.IO')
})

// Listen for online users
socket.on('online:users', (userIds: string[]) => {
  console.log('Online users:', userIds)
})

// Send direct message
socket.emit('direct:message', {
  receiverId: '67890abc',
  content: 'Hello!'
})

// Listen for incoming messages
socket.on('direct:message:received', (message) => {
  console.log('New message:', message)
})

// Show typing indicator
socket.emit('direct:typing', {
  receiverId: '67890abc',
  isTyping: true
})

// Disconnect
socket.disconnect()
```

---

**This is Part 3 of the documentation covering:**

- ✅ Services Layer (Auth, Attendance with full business logic)
- ✅ Controllers Layer (Request handlers, response formatting)
- ✅ Validation Layer (Zod schemas with types)
- ✅ Socket.IO Real-time (Complete implementation, events, client usage)

---

## 🛣️ Routes & API Structure

### Route Architecture

All routes are mounted under `/api/v1` prefix and organized by domain.

```typescript
// src/routes/index.route.ts
import express from 'express'
import authRoutes from './auth.route'
import userRoutes from './user.route'
import branchRoutes from './branch.route'
import employeeRoutes from './employee.route'
import shiftRoutes from './shift.route'
import shiftRegistrationRoutes from './shift-registration.route'
import attendanceRoutes from './attendance.route'
import notificationRoutes from './notification.route'
import reportRoutes from './report.route'
import messageRoutes from './message.route'
import violationRoutes from './violation.route'
import payrollRoutes from './payroll.route'

const router = express.Router()

// Mount routes
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/branches', branchRoutes)
router.use('/employees', employeeRoutes)
router.use('/shifts', shiftRoutes)
router.use('/shift-registrations', shiftRegistrationRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/notifications', notificationRoutes)
router.use('/reports', reportRoutes)
router.use('/messages', messageRoutes)
router.use('/violations', violationRoutes)
router.use('/payroll', payrollRoutes)

export default router
```

### API Base URL Structure

```
Production:  https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1
Development: http://localhost:5000/api/v1

Example endpoints:
├── /api/v1/auth/login
├── /api/v1/employees
├── /api/v1/attendance/check-in
└── /api/v1/reports/attendance/export
```

---

### Authentication Routes (`routes/auth.route.ts`)

```typescript
import express from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  verifyEmailController,
  resendVerificationEmailController,
  updateEmailController
} from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = express.Router()

// Public routes (no auth required)
router.post('/register', registerController)
router.post('/login', loginController)
router.get('/refresh-token', refreshTokenController)
router.post('/verify-email', verifyEmailController)
router.post('/resend-verification', resendVerificationEmailController)

// Protected routes (auth required)
router.post('/logout', authMiddleware, logoutController)
router.put('/update-email', authMiddleware, updateEmailController)

export default router
```

**Endpoints:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login with credentials |
| GET | `/auth/refresh-token` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout user |
| POST | `/auth/verify-email` | ❌ | Verify email with code |
| POST | `/auth/resend-verification` | ❌ | Resend verification code |
| PUT | `/auth/update-email` | ✅ | Add/update email |

---

### Attendance Routes (`routes/attendance.route.ts`)

```typescript
import { Router } from 'express'
import {
  checkInController,
  checkOutController,
  getAttendancesController,
  getAttendanceByIdController,
  getMonthlyReportController
} from '../controllers/attendance.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { authenticatedOnly } from '../middleware/role.middleware'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

router.post('/check-in', authenticatedOnly, checkInController)
router.post('/check-out', authenticatedOnly, checkOutController)
router.get('/', authenticatedOnly, getAttendancesController)
router.get('/report/monthly', authenticatedOnly, getMonthlyReportController)
router.get('/:id', authenticatedOnly, getAttendanceByIdController)

export default router
```

**Route Pattern:**

```typescript
// Pattern: Middleware → Role Check → Controller
router.METHOD(
  '/path',
  authMiddleware, // Verify JWT
  roleMiddleware, // Check permissions
  controller // Handle request
)
```

---

### Complete API Endpoint Map

```
/api/v1
│
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── GET    /refresh-token
│   ├── POST   /logout
│   ├── POST   /verify-email
│   ├── POST   /resend-verification
│   └── PUT    /update-email
│
├── /employees
│   ├── GET    /                      (List all)
│   ├── POST   /                      (Create - Admin only)
│   ├── GET    /:id                   (Get by ID)
│   ├── PUT    /:id                   (Update - Admin only)
│   ├── DELETE /:id                   (Delete - Admin only)
│   └── GET    /branch/:branchId      (By branch - Manager+)
│
├── /branches
│   ├── GET    /                      (List all)
│   ├── POST   /                      (Create - Admin only)
│   ├── GET    /:id                   (Get by ID)
│   ├── PUT    /:id                   (Update - Admin only)
│   └── DELETE /:id                   (Delete - Admin only)
│
├── /shifts
│   ├── GET    /                      (List all)
│   ├── POST   /                      (Create - Admin only)
│   ├── GET    /:id                   (Get by ID)
│   ├── PUT    /:id                   (Update - Admin only)
│   ├── DELETE /:id                   (Delete - Admin only)
│   └── GET    /branch/:branchId      (By branch - Manager+)
│
├── /shift-registrations
│   ├── GET    /                      (List all - Manager+)
│   ├── POST   /                      (Create - Manager+)
│   ├── GET    /:id                   (Get by ID)
│   ├── PUT    /:id                   (Update - Manager+)
│   ├── DELETE /:id                   (Delete - Manager+)
│   ├── GET    /employee/:employeeId  (By employee)
│   └── GET    /shift/:shiftId        (By shift - Manager+)
│
├── /attendance
│   ├── POST   /check-in              (Check in)
│   ├── POST   /check-out             (Check out)
│   ├── GET    /                      (List all - Manager+)
│   ├── GET    /:id                   (Get by ID)
│   ├── PUT    /:id                   (Update - Manager+)
│   ├── DELETE /:id                   (Delete - Admin only)
│   ├── GET    /employee/:employeeId  (By employee)
│   └── GET    /report/monthly        (Monthly report)
│
├── /notifications
│   ├── GET    /                      (List all)
│   ├── POST   /                      (Create - Manager+)
│   ├── GET    /:id                   (Get by ID)
│   ├── PUT    /:id                   (Mark as read)
│   ├── DELETE /:id                   (Delete)
│   └── PUT    /mark-all-read         (Mark all as read)
│
├── /messages
│   ├── GET    /                      (List conversations)
│   ├── POST   /                      (Send message)
│   ├── GET    /:id                   (Get by ID)
│   ├── DELETE /:id                   (Delete)
│   ├── GET    /conversation/:userId  (With specific user)
│   └── PUT    /mark-read/:conversationId (Mark as read)
│
├── /payroll
│   ├── GET    /                      (List all - Manager+)
│   ├── POST   /                      (Create - Manager+)
│   ├── GET    /:id                   (Get by ID)
│   ├── PUT    /:id                   (Update - Manager+)
│   ├── DELETE /:id                   (Delete - Admin only)
│   └── GET    /employee/:employeeId  (By employee)
│
├── /violations
│   ├── GET    /                      (List all - Manager+)
│   ├── POST   /                      (Create - Manager+)
│   ├── GET    /:id                   (Get by ID)
│   ├── PUT    /:id                   (Update - Manager+)
│   ├── DELETE /:id                   (Delete - Admin only)
│   └── GET    /employee/:employeeId  (By employee)
│
└── /reports
    ├── POST   /attendance/export     (Export CSV/PDF - Manager+)
    └── GET    /monthly/:branchId     (Monthly report - Manager+)
```

---

## 🛠️ Utility Functions

### 1. Password Hashing (`utils/bcrypt.ts`)

```typescript
import bcrypt from 'bcrypt'

/**
 * Hash a plain text password
 * @param value - Plain text password
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Hashed password
 */
export const hashValue = async (value: string, saltRounds: number = 10): Promise<string> => {
  return await bcrypt.hash(value, saltRounds)
}

/**
 * Compare plain text password with hashed password
 * @param value - Plain text password
 * @param hashedValue - Hashed password from database
 * @returns Boolean indicating match
 */
export const compareValue = async (value: string, hashedValue: string): Promise<boolean> => {
  return await bcrypt.compare(value, hashedValue)
}
```

**Usage:**

```typescript
// In employee model pre-save hook
employeeSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashValue(this.password)
  }
  next()
})

// In login service
const isValid = await compareValue(inputPassword, user.password)
```

---

### 2. Environment Helper (`utils/get-env.ts`)

```typescript
/**
 * Safely get environment variable with validation
 * @param key - Environment variable key
 * @param defaultValue - Optional default value
 * @returns Environment variable value
 * @throws Error if variable not found and no default
 */
export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key]

  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not set`)
    }
    return defaultValue
  }

  return value
}
```

**Usage:**

```typescript
// In config files
const envConfig = () => ({
  PORT: getEnv('PORT', '5000'), // With default
  JWT_SECRET: getEnv('JWT_SECRET'), // Required, no default
  MONGO_URI: getEnv('MONGO_URI') // Required
})
```

---

### 3. HTTP Status Codes (`config/http.config.ts`)

```typescript
const httpConfig = () => ({
  // Success responses
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client error responses
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server error responses
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
})

export const HTTPSTATUS = httpConfig()
export type HttpStatusCodeType = (typeof HTTPSTATUS)[keyof typeof HTTPSTATUS]
```

**Usage:**

```typescript
return res.status(HTTPSTATUS.CREATED).json({
  message: 'Resource created',
  data: result
})
```

---

## 📧 Email Service (`utils/email.ts`)

### Email Configuration

```typescript
import nodemailer from 'nodemailer'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Gmail App Password
    }
  })
}

// Generic send email function
export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"EMS System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent:', info.messageId)
  } catch (error) {
    console.error('❌ Email error:', error)
    throw new Error('Failed to send email')
  }
}
```

---

### Email Templates

#### 1. Email Verification

```typescript
export const sendVerificationEmail = async (email: string, name: string, code: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #007bff;
          letter-spacing: 8px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verify Your Email</h2>
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <div class="code">${code}</div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - EMS',
    html,
    text: `Your verification code is: ${code}`
  })
}
```

#### 2. Password Reset Email

```typescript
export const sendResetPasswordEmail = async (email: string, resetToken: string, name: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <div class="container">
        <h2>Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <p><strong>Link expires in 15 minutes.</strong></p>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - EMS',
    html
  })
}
```

**Gmail App Password Setup:**

1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate App Password
4. Use App Password in `EMAIL_PASSWORD` env variable

---

## 📊 Report Generation Service

### CSV Export (`services/report.service.ts`)

```typescript
import { createObjectCsvWriter } from 'csv-writer'
import path from 'path'
import fs from 'fs'
import AttendanceModel from '../models/attendance.model'

export const exportAttendanceCSV = async (query: { month: number; year: number; branchId?: string }, res: Response) => {
  const { month, year, branchId } = query

  // 1. Build date range
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  // 2. Fetch attendance data
  const attendances = await AttendanceModel.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .populate('employeeId', 'name email')
    .populate('shiftId', 'shiftName startTime endTime')
    .lean()

  // 3. Filter by branch if needed
  let filteredData = attendances
  if (branchId) {
    filteredData = attendances.filter((att) => att.employeeId?.branchId?.toString() === branchId)
  }

  // 4. Format data for CSV
  const csvData = filteredData.map((attendance) => ({
    date: new Date(attendance.date).toLocaleDateString(),
    employeeName: attendance.employeeId?.name || 'N/A',
    email: attendance.employeeId?.email || 'N/A',
    shiftName: attendance.shiftId?.shiftName || 'N/A',
    shiftTime: `${attendance.shiftId?.startTime} - ${attendance.shiftId?.endTime}`,
    checkInTime: attendance.checkInTime || 'N/A',
    checkOutTime: attendance.checkOutTime || 'N/A',
    workHours: attendance.workHours?.toFixed(2) || '0',
    status: attendance.status
  }))

  // 5. Create CSV file
  const fileName = `attendance_${year}_${month}_${Date.now()}.csv`
  const filePath = path.join(process.cwd(), 'exports', fileName)

  // Ensure exports directory exists
  const exportsDir = path.join(process.cwd(), 'exports')
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true })
  }

  // 6. Write CSV
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'date', title: 'Date' },
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

  // 7. Send file and cleanup
  res.download(filePath, fileName, (err) => {
    if (err) console.error('Download error:', err)
    // Delete file after sending
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error('Cleanup error:', unlinkErr)
    })
  })
}
```

---

### PDF Export

```typescript
import PDFDocument from 'pdfkit'

export const exportAttendancePDF = async (
  query: { month: number; year: number },
  res: Response
) => {
  // Fetch data (same as CSV)
  const attendances = await AttendanceModel.find({...}).populate(...)

  // Create PDF document
  const doc = new PDFDocument({ margin: 50 })
  const fileName = `attendance_${query.year}_${query.month}.pdf`

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

  // Pipe PDF to response
  doc.pipe(res)

  // Header
  doc.fontSize(20).text('Attendance Report', { align: 'center' })
  doc.fontSize(12).text(`${getMonthName(query.month)} ${query.year}`, {
    align: 'center'
  })
  doc.moveDown()

  // Table header
  const tableTop = 150
  doc.fontSize(10).font('Helvetica-Bold')
  doc.text('Date', 50, tableTop)
  doc.text('Employee', 120, tableTop)
  doc.text('Check In', 250, tableTop)
  doc.text('Check Out', 350, tableTop)
  doc.text('Hours', 450, tableTop)

  // Table rows
  let y = tableTop + 25
  doc.font('Helvetica')

  attendances.forEach(attendance => {
    if (y > 700) { // New page if needed
      doc.addPage()
      y = 50
    }

    doc.text(formatDate(attendance.date), 50, y)
    doc.text(attendance.employeeId?.name || 'N/A', 120, y)
    doc.text(formatTime(attendance.checkInTime), 250, y)
    doc.text(formatTime(attendance.checkOutTime), 350, y)
    doc.text(attendance.workHours?.toFixed(2) || '0', 450, y)

    y += 20
  })

  // Footer
  doc.fontSize(8).text(
    `Generated on ${new Date().toLocaleString()}`,
    50,
    doc.page.height - 50,
    { align: 'center' }
  )

  // Finalize PDF
  doc.end()
}
```

---

## 🌱 Database Seeding (`scripts/seed.ts`)

### Seed Script Purpose

- Create initial test data for development
- Populate all collections with realistic data
- Include users with different roles
- Create relationships between entities

### Seed Data Structure

```typescript
import mongoose from 'mongoose'
import { config } from 'dotenv'
import BranchModel from '../models/branch.model'
import EmployeeModel from '../models/employee.model'
import ShiftModel from '../models/shift.model'
// ... other models

config()

const MONGO_URI = process.env.MONGO_URI

// 1. Branch data
const branches = [
  {
    branchName: 'Head Office',
    address: '123 Main Street, New York, NY 10001',
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      radius: 500 // meters
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
  }
]

// 2. Employee data (with different roles)
const getEmployeesData = (branchIds: mongoose.Types.ObjectId[]) => [
  // Admin
  {
    name: 'John Admin',
    username: 'admin',
    role: 'admin',
    branchId: branchIds[0],
    phone: '+1234567890',
    email: 'admin@ems.com',
    password: 'Admin@123' // Will be hashed
  },
  // Managers
  {
    name: 'Michael Manager',
    username: 'michael.manager',
    role: 'manager',
    branchId: branchIds[0],
    email: 'michael.manager@ems.com',
    password: 'Manager@123'
  },
  // Employees
  {
    name: 'Alice Johnson',
    username: 'alice.johnson',
    role: 'employee',
    branchId: branchIds[0],
    email: 'alice.johnson@ems.com',
    password: 'Employee@123'
  }
  // ... more employees
]

// 3. Shift data
const getShiftsData = (branchIds: mongoose.Types.ObjectId[]) => [
  {
    shiftName: 'Morning Shift',
    startTime: '08:00',
    endTime: '16:00',
    branchId: branchIds[0],
    maxEmployees: 10,
    description: 'Regular morning shift'
  },
  {
    shiftName: 'Afternoon Shift',
    startTime: '16:00',
    endTime: '00:00',
    branchId: branchIds[0],
    maxEmployees: 8
  }
]

// Main seed function
const seed = async () => {
  try {
    // Connect to database
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Promise.all([
      BranchModel.deleteMany({}),
      EmployeeModel.deleteMany({}),
      ShiftModel.deleteMany({}),
      ShiftRegistrationModel.deleteMany({}),
      AttendanceModel.deleteMany({}),
      NotificationModel.deleteMany({}),
      MessageModel.deleteMany({}),
      ViolationModel.deleteMany({}),
      PayrollModel.deleteMany({})
    ])
    console.log('🗑️  Cleared existing data')

    // 1. Create branches
    const createdBranches = await BranchModel.insertMany(branches)
    const branchIds = createdBranches.map((b) => b._id)
    console.log(`✅ Created ${branchIds.length} branches`)

    // 2. Create employees
    const employeesData = getEmployeesData(branchIds)
    const createdEmployees = await EmployeeModel.insertMany(employeesData)
    const employeeIds = createdEmployees.map((e) => e._id)
    console.log(`✅ Created ${employeeIds.length} employees`)

    // 3. Create shifts
    const shiftsData = getShiftsData(branchIds)
    const createdShifts = await ShiftModel.insertMany(shiftsData)
    const shiftIds = createdShifts.map((s) => s._id)
    console.log(`✅ Created ${shiftIds.length} shifts`)

    // 4. Create shift registrations
    const registrations = []
    const today = new Date()

    for (const employeeId of employeeIds.slice(0, 5)) {
      registrations.push({
        employeeId,
        shiftId: shiftIds[0],
        date: today,
        status: 'approved'
      })
    }

    await ShiftRegistrationModel.insertMany(registrations)
    console.log(`✅ Created ${registrations.length} shift registrations`)

    // 5. Create sample attendance records
    // 6. Create notifications
    // 7. Create messages
    // ... etc

    console.log('✅ Database seeding completed!')

    // Print test credentials
    console.log('\n📝 Test Credentials:')
    console.log('Admin:')
    console.log('  Username: admin')
    console.log('  Password: Admin@123')
    console.log('\nManager:')
    console.log('  Username: michael.manager')
    console.log('  Password: Manager@123')
    console.log('\nEmployee:')
    console.log('  Username: alice.johnson')
    console.log('  Password: Employee@123')
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  }
}

// Run seed
seed()
```

### Running the Seed Script

```bash
# Development
npm run seed

# Or with tsx directly
npx tsx src/scripts/seed.ts
```

---

## 🚀 Deployment Guide (Azure)

### Prerequisites

- Azure account
- Azure CLI installed
- Git repository

### Deployment Steps

#### 1. Create Azure Web App

```bash
# Login to Azure
az login

# Create resource group
az group create --name ems-resources --location southeastasia

# Create App Service plan
az appservice plan create \
  --name ems-plan \
  --resource-group ems-resources \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name emsbackend-enh5aahkg4dcfkfs \
  --resource-group ems-resources \
  --plan ems-plan \
  --runtime "NODE:18-lts"
```

#### 2. Configure Environment Variables

```bash
# Set all environment variables
az webapp config appsettings set \
  --name emsbackend-enh5aahkg4dcfkfs \
  --resource-group ems-resources \
  --settings \
    PORT=8080 \
    NODE_ENV=production \
    MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/ems" \
    JWT_SECRET="your_secret_key_here" \
    JWT_EXPIRATION="1h" \
    FRONTEND_URL="https://your-frontend.com" \
    EMAIL_HOST="smtp.gmail.com" \
    EMAIL_PORT="587" \
    EMAIL_USER="your-email@gmail.com" \
    EMAIL_PASSWORD="your-app-password"
```

#### 3. Configure Build Settings

Create `package.json` build script:

```json
{
  "scripts": {
    "build": "rimraf ./dist && tsc && tsc-alias",
    "start": "node dist/index.js"
  }
}
```

Create `.deployment` file (optional):

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

#### 4. Deploy from Git

```bash
# Configure deployment source
az webapp deployment source config \
  --name emsbackend-enh5aahkg4dcfkfs \
  --resource-group ems-resources \
  --repo-url https://github.com/ClowderDev/EMS-BE \
  --branch main \
  --manual-integration

# Or use local Git
az webapp deployment source config-local-git \
  --name emsbackend-enh5aahkg4dcfkfs \
  --resource-group ems-resources

# Get Git URL
az webapp deployment list-publishing-credentials \
  --name emsbackend-enh5aahkg4dcfkfs \
  --resource-group ems-resources \
  --query scmUri \
  --output tsv

# Add remote and push
git remote add azure <git-url>
git push azure main
```

#### 5. Enable Logging

```bash
# Enable application logging
az webapp log config \
  --name emsbackend-enh5aahkg4dcfkfs \
  --resource-group ems-resources \
  --application-logging filesystem \
  --level information

# Stream logs
az webapp log tail \
  --name emsbackend-enh5aahkg4dcfkfs \
  --resource-group ems-resources
```

#### 6. Configure CORS

```bash
az webapp cors add \
  --name emsbackend-enh5aahkg4dcfkfs \
  --resource-group ems-resources \
  --allowed-origins https://your-frontend.com http://localhost:5173
```

---

### Post-Deployment Checklist

- ✅ Verify environment variables are set
- ✅ Check application logs for errors
- ✅ Test API endpoints (use cURL or Postman)
- ✅ Verify database connection
- ✅ Test authentication flow
- ✅ Verify CORS is working
- ✅ Test Socket.IO connection
- ✅ Monitor performance and errors

---

### Testing Deployment

```bash
# Test health endpoint
curl https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1

# Test login
curl -X POST \
  https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ems.com","password":"Admin@123"}'

# Test protected endpoint
curl https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/employees \
  -H "Authorization: Bearer <token>"
```

---

### Troubleshooting

**Problem: Application not starting**

```bash
# Check logs
az webapp log tail --name emsbackend-enh5aahkg4dcfkfs --resource-group ems-resources

# Check environment variables
az webapp config appsettings list --name emsbackend-enh5aahkg4dcfkfs --resource-group ems-resources
```

**Problem: Database connection failed**

- Verify `MONGO_URI` is correct
- Check MongoDB Atlas allows Azure IP addresses
- Add `0.0.0.0/0` to MongoDB Atlas network access (for testing)

**Problem: CORS errors**

- Update CORS settings in Azure
- Verify `FRONTEND_URL` in environment variables
- Check `src/index.ts` CORS configuration

---

## 📚 Additional Resources

### Project Scripts

```json
{
  "scripts": {
    "dev": "npx nodemon", // Start dev server with auto-reload
    "build": "rimraf ./dist && tsc && tsc-alias", // Build for production
    "start": "node dist/index.js", // Run production build
    "seed": "tsx src/scripts/seed.ts", // Seed database
    "verify-seed": "tsx src/scripts/verify-seed.ts", // Verify seed data
    "lint": "eslint .", // Check code quality
    "lint:fix": "eslint . --fix", // Auto-fix linting issues
    "prettier": "prettier --check .", // Check formatting
    "prettier:fix": "prettier --write ." // Auto-format code
  }
}
```

### Development Workflow

```bash
# 1. Clone repository
git clone https://github.com/ClowderDev/EMS-BE.git
cd EMS-BE

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Seed database
npm run seed

# 5. Start development server
npm run dev

# 6. Run linter
npm run lint:fix

# 7. Build for production
npm run build

# 8. Test production build
npm start
```

### Key Technologies Documentation

- **Express.js**: https://expressjs.com/
- **TypeScript**: https://www.typescriptlang.org/
- **Mongoose**: https://mongoosejs.com/
- **Socket.IO**: https://socket.io/
- **Zod**: https://zod.dev/
- **JWT**: https://jwt.io/
- **Nodemailer**: https://nodemailer.com/
- **Azure App Service**: https://azure.microsoft.com/en-us/products/app-service

---

## 🎓 Summary

This Employee Management System backend is a production-ready REST API built with:

### ✅ **Core Features**

- JWT-based authentication with refresh tokens
- Role-based authorization (Admin, Manager, Employee)
- GPS-based attendance tracking with geofencing
- Real-time messaging via Socket.IO
- Email verification system
- Report generation (CSV/PDF)
- Comprehensive error handling
- Input validation with Zod

### 🏗️ **Architecture**

- Layered architecture (Routes → Controllers → Services → Models)
- Middleware pipeline for request processing
- Custom error classes with error codes
- Type-safe with TypeScript
- MongoDB with Mongoose ODM

### 🔒 **Security**

- Password hashing with bcrypt
- HTTP-only cookies for tokens
- CORS configuration
- Role-based access control
- Input sanitization and validation

### 📊 **Business Logic**

- Complex attendance validation (6-step process)
- Haversine formula for GPS distance calculation
- Shift registration system
- Automated work hours calculation
- Payroll and violation tracking

### 🚀 **Deployment**

- Deployed on Azure App Service
- Production URL: https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net
- Environment-based configuration
- Logging and monitoring enabled

---

**🎉 Complete! This documentation provides everything a developer needs to understand, maintain, and extend the EMS backend system.**

For questions or issues, refer to:

- API Guides: `docs/FRONTEND_API_GUIDE.md`, `docs/ANDROID_API_GUIDE.md`
- This Architecture Doc: `docs/BACKEND_ARCHITECTURE.md`
- Source Code: Well-commented and organized

**Happy Coding! 🚀**
