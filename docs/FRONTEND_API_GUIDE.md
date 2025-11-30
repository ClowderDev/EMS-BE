# 🚀 Frontend Developer API Guide

**Employee Management System (EMS) - Complete API Reference**

This guide is designed for frontend developers who are new to API integration. We'll walk through everything step-by-step with real examples!

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication Flow](#authentication-flow)
3. [Making API Calls](#making-api-calls)
4. [All API Endpoints](#all-api-endpoints)
5. [Common Patterns](#common-patterns)
6. [Error Handling](#error-handling)
7. [Real-World Examples](#real-world-examples)

---

## 🎯 Getting Started

### Base URL

**Development:**

```
http://localhost:5000/api/v1
```

**Production (Deployed on Azure):**

```
https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1
```

### What You Need to Know

1. **Authentication** - Most endpoints require a login token (JWT)
2. **Headers** - Every request needs proper headers
3. **HTTP Methods** - GET (read), POST (create), PUT (update), DELETE (delete)
4. **Response Format** - All responses follow the same pattern

### Response Pattern

Every successful response looks like this:

```json
{
  "message": "Success message here",
  "data": {
    // Your actual data here
  }
}
```

Every error response looks like this:

```json
{
  "message": "Error message here",
  "errorCode": "ERROR_TYPE"
}
```

---

## 🔐 Authentication Flow

### Step 1: Login

**Endpoint:** `POST /auth/login`

**When to use:** User wants to sign in

**Request:**

```javascript
// Using fetch (vanilla JavaScript)
const response = await fetch(
  'https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/auth/login',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@ems.com', // Can be email OR username
      password: 'Admin@123'
    })
  }
)

const data = await response.json()
console.log(data)
```

**Response:**

```json
{
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "67890abc",
      "username": "admin",
      "email": "admin@ems.com",
      "name": "Admin User",
      "role": "admin",
      "isEmailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**What to do with the token:**

```javascript
// Save the token in localStorage
localStorage.setItem('accessToken', data.data.accessToken)
localStorage.setItem('refreshToken', data.data.refreshToken)
localStorage.setItem('user', JSON.stringify(data.data.user))
```

---

### Step 2: Using the Token

For ALL authenticated requests, include the token in headers:

```javascript
const token = localStorage.getItem('accessToken')

const response = await fetch(
  'https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/employees',
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` // ⚠️ IMPORTANT: Add this line!
    }
  }
)
```

---

### Step 3: Refresh Token (When Access Token Expires)

**Endpoint:** `POST /auth/refresh-token`

**When to use:** When you get a 401 error (token expired)

**Request:**

```javascript
const refreshToken = localStorage.getItem('refreshToken')

const response = await fetch(
  'https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/auth/refresh-token',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refreshToken: refreshToken
    })
  }
)

const data = await response.json()

// Save the new token
localStorage.setItem('accessToken', data.data.accessToken)
```

---

### Step 4: Logout

**Endpoint:** `POST /auth/logout`

```javascript
const token = localStorage.getItem('accessToken')

await fetch('https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  }
})

// Clear everything
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')
localStorage.removeItem('user')
```

---

## 🛠️ Making API Calls

### Using Fetch (Vanilla JavaScript)

#### GET Request (Read Data)

```javascript
async function getEmployees() {
  const token = localStorage.getItem('accessToken')

  try {
    const response = await fetch(
      'https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/employees',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch')
    }

    const data = await response.json()
    console.log(data.data.employees) // Array of employees
    return data.data.employees
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### POST Request (Create Data)

```javascript
async function createEmployee(employeeData) {
  const token = localStorage.getItem('accessToken')

  try {
    const response = await fetch(
      'https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/employees',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(employeeData)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(data.message) // Show error to user
      return
    }

    alert('Employee created successfully!')
    return data.data.employee
  } catch (error) {
    console.error('Error:', error)
  }
}

// Usage:
createEmployee({
  name: 'John Doe',
  username: 'john.doe',
  email: 'john@example.com',
  password: 'Password@123',
  role: 'employee',
  phone: '+1234567890',
  branchId: '507f1f77bcf86cd799439011'
})
```

#### PUT Request (Update Data)

```javascript
async function updateEmployee(employeeId, updates) {
  const token = localStorage.getItem('accessToken')

  const response = await fetch(
    `https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1/employees/${employeeId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    }
  )

  const data = await response.json()
  return data.data.employee
}

// Usage:
updateEmployee('67890abc', {
  name: 'Jane Doe',
  phone: '+9876543210'
})
```

#### DELETE Request

```javascript
async function deleteEmployee(employeeId) {
  const token = localStorage.getItem('accessToken')

  const response = await fetch(`http://localhost:5000/api/v1/employees/${employeeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const data = await response.json()
  alert(data.message) // "Employee deleted successfully"
}
```

---

### Using Axios (Recommended)

First, install axios:

```bash
npm install axios
```

#### Setup Axios Instance (Do this once)

```javascript
// api.js - Create this file
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1', // Production URL
  // For local development: 'http://localhost:5000/api/v1'
  headers: {
    'Content-Type': 'application/json'
  }
})

// Automatically add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Automatically handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If token expired, refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      try {
        const response = await axios.post('http://localhost:5000/api/v1/auth/refresh-token', { refreshToken })

        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (err) {
        // Refresh failed, logout user
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
```

#### Using the Axios Instance

```javascript
import api from './api'

// GET
const getEmployees = async () => {
  const response = await api.get('/employees')
  return response.data.data.employees
}

// POST
const createEmployee = async (data) => {
  const response = await api.post('/employees', data)
  return response.data.data.employee
}

// PUT
const updateEmployee = async (id, data) => {
  const response = await api.put(`/employees/${id}`, data)
  return response.data.data.employee
}

// DELETE
const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`)
  return response.data
}
```

---

## 📚 All API Endpoints

### 🔐 Authentication

| Endpoint                    | Method | Auth | Description                    |
| --------------------------- | ------ | ---- | ------------------------------ |
| `/auth/register`            | POST   | ❌   | Register new user              |
| `/auth/login`               | POST   | ❌   | Login with email/username      |
| `/auth/logout`              | POST   | ✅   | Logout user                    |
| `/auth/refresh-token`       | POST   | ❌   | Get new access token           |
| `/auth/update-email`        | PUT    | ✅   | Add/update email (first-time)  |
| `/auth/verify-email`        | POST   | ❌   | Verify email with 6-digit code |
| `/auth/resend-verification` | POST   | ❌   | Resend verification code       |

### 👥 Users

| Endpoint                     | Method | Auth | Role  | Description                      |
| ---------------------------- | ------ | ---- | ----- | -------------------------------- |
| `/users`                     | GET    | ✅   | All   | Get all users (filtered by role) |
| `/users/:id`                 | GET    | ✅   | All   | Get user by ID                   |
| `/users/:id`                 | PUT    | ✅   | Admin | Update user                      |
| `/users/:id`                 | DELETE | ✅   | Admin | Delete user                      |
| `/users/:id/change-password` | PUT    | ✅   | All   | Change password                  |

### 👤 Employees

| Endpoint                      | Method | Auth | Role     | Description             |
| ----------------------------- | ------ | ---- | -------- | ----------------------- |
| `/employees`                  | GET    | ✅   | All      | Get all employees       |
| `/employees`                  | POST   | ✅   | Admin    | Create employee         |
| `/employees/:id`              | GET    | ✅   | All      | Get employee by ID      |
| `/employees/:id`              | PUT    | ✅   | Admin    | Update employee         |
| `/employees/:id`              | DELETE | ✅   | Admin    | Delete employee         |
| `/employees/branch/:branchId` | GET    | ✅   | Manager+ | Get employees by branch |

### 🏢 Branches

| Endpoint        | Method | Auth | Role  | Description      |
| --------------- | ------ | ---- | ----- | ---------------- |
| `/branches`     | GET    | ✅   | All   | Get all branches |
| `/branches`     | POST   | ✅   | Admin | Create branch    |
| `/branches/:id` | GET    | ✅   | All   | Get branch by ID |
| `/branches/:id` | PUT    | ✅   | Admin | Update branch    |
| `/branches/:id` | DELETE | ✅   | Admin | Delete branch    |

### ⏰ Shifts

| Endpoint                   | Method | Auth | Role     | Description          |
| -------------------------- | ------ | ---- | -------- | -------------------- |
| `/shifts`                  | GET    | ✅   | All      | Get all shifts       |
| `/shifts`                  | POST   | ✅   | Admin    | Create shift         |
| `/shifts/:id`              | GET    | ✅   | All      | Get shift by ID      |
| `/shifts/:id`              | PUT    | ✅   | Admin    | Update shift         |
| `/shifts/:id`              | DELETE | ✅   | Admin    | Delete shift         |
| `/shifts/branch/:branchId` | GET    | ✅   | Manager+ | Get shifts by branch |

### 📝 Shift Registration

| Endpoint                                    | Method | Auth | Role     | Description                  |
| ------------------------------------------- | ------ | ---- | -------- | ---------------------------- |
| `/shift-registrations`                      | GET    | ✅   | Manager+ | Get all registrations        |
| `/shift-registrations`                      | POST   | ✅   | Manager+ | Register employee to shift   |
| `/shift-registrations/:id`                  | GET    | ✅   | All      | Get registration by ID       |
| `/shift-registrations/:id`                  | PUT    | ✅   | Manager+ | Update registration          |
| `/shift-registrations/:id`                  | DELETE | ✅   | Manager+ | Delete registration          |
| `/shift-registrations/employee/:employeeId` | GET    | ✅   | All      | Get employee's registrations |
| `/shift-registrations/shift/:shiftId`       | GET    | ✅   | Manager+ | Get registrations by shift   |

### 📍 Attendance

| Endpoint                                      | Method | Auth | Role     | Description                  |
| --------------------------------------------- | ------ | ---- | -------- | ---------------------------- |
| `/attendance`                                 | GET    | ✅   | Manager+ | Get all attendance           |
| `/attendance/check-in`                        | POST   | ✅   | Employee | Check in to work             |
| `/attendance/check-out`                       | POST   | ✅   | Employee | Check out from work          |
| `/attendance/:id`                             | GET    | ✅   | All      | Get attendance by ID         |
| `/attendance/:id`                             | PUT    | ✅   | Manager+ | Update attendance            |
| `/attendance/:id`                             | DELETE | ✅   | Admin    | Delete attendance            |
| `/attendance/employee/:employeeId`            | GET    | ✅   | All      | Get employee attendance      |
| `/attendance/employee/:employeeId/date-range` | GET    | ✅   | All      | Get attendance by date range |

### 🔔 Notifications

| Endpoint                       | Method | Auth | Role     | Description              |
| ------------------------------ | ------ | ---- | -------- | ------------------------ |
| `/notifications`               | GET    | ✅   | All      | Get user's notifications |
| `/notifications`               | POST   | ✅   | Manager+ | Create notification      |
| `/notifications/:id`           | GET    | ✅   | All      | Get notification by ID   |
| `/notifications/:id`           | PUT    | ✅   | All      | Mark as read             |
| `/notifications/:id`           | DELETE | ✅   | All      | Delete notification      |
| `/notifications/mark-all-read` | PUT    | ✅   | All      | Mark all as read         |

### 💬 Messages

| Endpoint                              | Method | Auth | Role | Description                |
| ------------------------------------- | ------ | ---- | ---- | -------------------------- |
| `/messages`                           | GET    | ✅   | All  | Get user's conversations   |
| `/messages`                           | POST   | ✅   | All  | Send message               |
| `/messages/:id`                       | GET    | ✅   | All  | Get message by ID          |
| `/messages/:id`                       | DELETE | ✅   | All  | Delete message             |
| `/messages/conversation/:userId`      | GET    | ✅   | All  | Get conversation with user |
| `/messages/mark-read/:conversationId` | PUT    | ✅   | All  | Mark messages as read      |

### 💰 Payroll

| Endpoint                        | Method | Auth | Role     | Description           |
| ------------------------------- | ------ | ---- | -------- | --------------------- |
| `/payroll`                      | GET    | ✅   | Manager+ | Get all payrolls      |
| `/payroll`                      | POST   | ✅   | Manager+ | Create payroll        |
| `/payroll/:id`                  | GET    | ✅   | All      | Get payroll by ID     |
| `/payroll/:id`                  | PUT    | ✅   | Manager+ | Update payroll        |
| `/payroll/:id`                  | DELETE | ✅   | Admin    | Delete payroll        |
| `/payroll/employee/:employeeId` | GET    | ✅   | All      | Get employee payrolls |

### ⚠️ Violations

| Endpoint                           | Method | Auth | Role     | Description             |
| ---------------------------------- | ------ | ---- | -------- | ----------------------- |
| `/violations`                      | GET    | ✅   | Manager+ | Get all violations      |
| `/violations`                      | POST   | ✅   | Manager+ | Create violation        |
| `/violations/:id`                  | GET    | ✅   | All      | Get violation by ID     |
| `/violations/:id`                  | PUT    | ✅   | Manager+ | Update violation        |
| `/violations/:id`                  | DELETE | ✅   | Admin    | Delete violation        |
| `/violations/employee/:employeeId` | GET    | ✅   | All      | Get employee violations |

### 📊 Reports

| Endpoint                     | Method | Auth | Role     | Description                 |
| ---------------------------- | ------ | ---- | -------- | --------------------------- |
| `/reports/attendance/export` | POST   | ✅   | Manager+ | Export attendance (CSV/PDF) |
| `/reports/monthly/:branchId` | GET    | ✅   | Manager+ | Get monthly report          |

---

## 🔄 Common Patterns

### 1. Loading States

```javascript
const [loading, setLoading] = useState(false)
const [employees, setEmployees] = useState([])

async function fetchEmployees() {
  setLoading(true)
  try {
    const response = await api.get('/employees')
    setEmployees(response.data.data.employees)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

### 2. Pagination

```javascript
// Backend returns paginated data
const response = await api.get('/employees?page=1&limit=10')

console.log(response.data.data)
// {
//   employees: [...],
//   pagination: {
//     currentPage: 1,
//     totalPages: 5,
//     totalItems: 50,
//     limit: 10
//   }
// }
```

### 3. Filtering

```javascript
// Filter by role
const managers = await api.get('/employees?role=manager')

// Filter by branch
const branchEmployees = await api.get('/employees/branch/507f1f77bcf86cd799439011')

// Date range
const attendance = await api.get('/attendance/employee/67890abc/date-range?startDate=2024-01-01&endDate=2024-01-31')
```

### 4. Error Handling

```javascript
async function makeApiCall() {
  try {
    const response = await api.get('/employees')
    return response.data
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('Error:', error.response.data.message)
      alert(error.response.data.message)
    } else if (error.request) {
      // No response from server
      console.error('No response from server')
      alert('Network error. Please check your connection.')
    } else {
      // Other errors
      console.error('Error:', error.message)
    }
  }
}
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes

| Code | Meaning      | What to Do                          |
| ---- | ------------ | ----------------------------------- |
| 200  | Success      | Everything is fine!                 |
| 201  | Created      | Resource created successfully       |
| 400  | Bad Request  | Check your request data             |
| 401  | Unauthorized | Token expired, refresh or login     |
| 403  | Forbidden    | User doesn't have permission        |
| 404  | Not Found    | Resource doesn't exist              |
| 409  | Conflict     | Duplicate data (e.g., email exists) |
| 500  | Server Error | Backend problem                     |

### Error Response Format

```json
{
  "message": "Email is already in use",
  "errorCode": "VALIDATION_ERROR"
}
```

### Handling Errors in React

```javascript
import { useState } from 'react'

function EmployeeForm() {
  const [error, setError] = useState('')

  async function handleSubmit(formData) {
    setError('') // Clear previous errors

    try {
      await api.post('/employees', formData)
      alert('Success!')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div>
      {error && <div className='error'>{error}</div>}
      {/* Your form here */}
    </div>
  )
}
```

---

## 💡 Real-World Examples

### Example 1: Login Page

```javascript
import { useState } from 'react'
import api from './api'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      // Save token
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>

      {error && <div className='error'>{error}</div>}

      <input
        type='text'
        placeholder='Email or Username'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type='submit' disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### Example 2: Employee List

```javascript
import { useState, useEffect } from 'react'
import api from './api'

function EmployeeList() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    try {
      const response = await api.get('/employees')
      setEmployees(response.data.data.employees)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  async function deleteEmployee(id) {
    if (!confirm('Are you sure?')) return

    try {
      await api.delete(`/employees/${id}`)
      alert('Employee deleted!')
      fetchEmployees() // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Employees ({employees.length})</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.email || 'No email'}</td>
              <td>{emp.role}</td>
              <td>
                <button onClick={() => deleteEmployee(emp.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Example 3: Check-In/Check-Out

```javascript
import { useState } from 'react'
import api from './api'

function AttendanceButtons() {
  const [loading, setLoading] = useState(false)

  async function handleCheckIn() {
    setLoading(true)

    // Get user's location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await api.post('/attendance/check-in', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })

          alert(response.data.message)
        } catch (err) {
          alert(err.response?.data?.message || 'Check-in failed')
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        alert('Please enable location access')
        setLoading(false)
      }
    )
  }

  async function handleCheckOut() {
    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await api.post('/attendance/check-out', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })

          alert(response.data.message)
        } catch (err) {
          alert(err.response?.data?.message || 'Check-out failed')
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        alert('Please enable location access')
        setLoading(false)
      }
    )
  }

  return (
    <div>
      <button onClick={handleCheckIn} disabled={loading}>
        {loading ? 'Processing...' : 'Check In'}
      </button>

      <button onClick={handleCheckOut} disabled={loading}>
        {loading ? 'Processing...' : 'Check Out'}
      </button>
    </div>
  )
}
```

### Example 4: Create Employee Form

```javascript
import { useState, useEffect } from 'react'
import api from './api'

function CreateEmployeeForm() {
  const [branches, setBranches] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'employee',
    phone: '',
    branchId: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch branches on mount
  useEffect(() => {
    async function fetchBranches() {
      const response = await api.get('/branches')
      setBranches(response.data.data.branches)
    }
    fetchBranches()
  }, [])

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/employees', formData)
      alert('Employee created successfully!')

      // Reset form
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'employee',
        phone: '',
        branchId: ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Employee</h2>

      {error && <div className='error'>{error}</div>}

      <input type='text' name='name' placeholder='Full Name' value={formData.name} onChange={handleChange} required />

      <input
        type='text'
        name='username'
        placeholder='Username'
        value={formData.username}
        onChange={handleChange}
        required
      />

      <input type='email' name='email' placeholder='Email (optional)' value={formData.email} onChange={handleChange} />

      <input
        type='password'
        name='password'
        placeholder='Password'
        value={formData.password}
        onChange={handleChange}
        required
      />

      <select name='role' value={formData.role} onChange={handleChange} required>
        <option value='employee'>Employee</option>
        <option value='manager'>Manager</option>
        <option value='admin'>Admin</option>
      </select>

      <input
        type='tel'
        name='phone'
        placeholder='Phone Number'
        value={formData.phone}
        onChange={handleChange}
        required
      />

      <select name='branchId' value={formData.branchId} onChange={handleChange} required>
        <option value=''>Select Branch</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      <button type='submit' disabled={loading}>
        {loading ? 'Creating...' : 'Create Employee'}
      </button>
    </form>
  )
}
```

### Example 5: Real-time Notifications (Socket.IO)

```javascript
import { useEffect, useState } from 'react'
import io from 'socket.io-client'

function Notifications() {
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    // Connect to socket (Production URL)
    const newSocket = io('https://ems-be-8s6v.onrender.com', {
      // For local development: 'http://localhost:5000'
      auth: { token }
    })

    setSocket(newSocket)

    // Listen for new notifications
    newSocket.on('notification', (notification) => {
      console.log('New notification:', notification)
      setNotifications((prev) => [notification, ...prev])

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message
        })
      }
    })

    // Cleanup
    return () => newSocket.close()
  }, [])

  return (
    <div>
      <h3>Notifications ({notifications.length})</h3>
      {notifications.map((notif) => (
        <div key={notif.id} className='notification'>
          <strong>{notif.title}</strong>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 📱 Android/Java Integration

### Setup (build.gradle)

Add these dependencies to your `app/build.gradle`:

```gradle
dependencies {
    // Retrofit for API calls
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'

    // OkHttp for interceptors
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'

    // Gson for JSON parsing
    implementation 'com.google.code.gson:gson:2.10.1'

    // Socket.IO for real-time
    implementation 'io.socket:socket.io-client:2.1.0'
}
```

Add internet permission to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

---

### 1. Create Data Models

Create these Java classes in your `models` package:

**LoginRequest.java**

```java
public class LoginRequest {
    private String email;  // Can be email or username
    private String password;

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
```

**LoginResponse.java**

```java
public class LoginResponse {
    private String message;
    private Data data;

    public static class Data {
        private User user;
        private String accessToken;
        private String refreshToken;

        // Getters and Setters
        public User getUser() { return user; }
        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
    }

    public static class User {
        private String id;
        private String username;
        private String email;
        private String name;
        private String role;
        private boolean isEmailVerified;

        // Getters and Setters
        public String getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getRole() { return role; }
        public boolean isEmailVerified() { return isEmailVerified; }
    }

    // Getters
    public String getMessage() { return message; }
    public Data getData() { return data; }
}
```

**Employee.java**

```java
public class Employee {
    private String id;
    private String name;
    private String username;
    private String email;
    private String role;
    private String phone;
    private String branchId;
    private boolean isEmailVerified;

    // Constructor
    public Employee() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBranchId() { return branchId; }
    public void setBranchId(String branchId) { this.branchId = branchId; }

    public boolean isEmailVerified() { return isEmailVerified; }
    public void setEmailVerified(boolean emailVerified) { isEmailVerified = emailVerified; }
}
```

**ApiResponse.java** (Generic response wrapper)

```java
public class ApiResponse<T> {
    private String message;
    private T data;

    public String getMessage() { return message; }
    public T getData() { return data; }
}
```

**EmployeeListData.java**

```java
import java.util.List;

public class EmployeeListData {
    private List<Employee> employees;
    private Pagination pagination;

    public static class Pagination {
        private int currentPage;
        private int totalPages;
        private int totalItems;
        private int limit;

        // Getters
        public int getCurrentPage() { return currentPage; }
        public int getTotalPages() { return totalPages; }
        public int getTotalItems() { return totalItems; }
        public int getLimit() { return limit; }
    }

    // Getters
    public List<Employee> getEmployees() { return employees; }
    public Pagination getPagination() { return pagination; }
}
```

---

### 2. Create API Service Interface

**ApiService.java**

```java
import retrofit2.Call;
import retrofit2.http.*;

public interface ApiService {

    // ==================== AUTH ====================

    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("auth/logout")
    Call<ApiResponse<Void>> logout();

    @POST("auth/refresh-token")
    Call<LoginResponse> refreshToken(@Body RefreshTokenRequest request);

    @PUT("auth/update-email")
    Call<ApiResponse<LoginResponse.User>> updateEmail(@Body UpdateEmailRequest request);

    @POST("auth/verify-email")
    Call<ApiResponse<LoginResponse.User>> verifyEmail(@Body VerifyEmailRequest request);

    // ==================== EMPLOYEES ====================

    @GET("employees")
    Call<ApiResponse<EmployeeListData>> getEmployees(
        @Query("page") int page,
        @Query("limit") int limit,
        @Query("role") String role
    );

    @GET("employees/{id}")
    Call<ApiResponse<Employee>> getEmployeeById(@Path("id") String id);

    @POST("employees")
    Call<ApiResponse<Employee>> createEmployee(@Body Employee employee);

    @PUT("employees/{id}")
    Call<ApiResponse<Employee>> updateEmployee(
        @Path("id") String id,
        @Body Employee employee
    );

    @DELETE("employees/{id}")
    Call<ApiResponse<Void>> deleteEmployee(@Path("id") String id);

    @GET("employees/branch/{branchId}")
    Call<ApiResponse<EmployeeListData>> getEmployeesByBranch(
        @Path("branchId") String branchId
    );

    // ==================== BRANCHES ====================

    @GET("branches")
    Call<ApiResponse<BranchListData>> getBranches();

    @GET("branches/{id}")
    Call<ApiResponse<Branch>> getBranchById(@Path("id") String id);

    @POST("branches")
    Call<ApiResponse<Branch>> createBranch(@Body Branch branch);

    // ==================== ATTENDANCE ====================

    @POST("attendance/check-in")
    Call<ApiResponse<Attendance>> checkIn(@Body CheckInRequest request);

    @POST("attendance/check-out")
    Call<ApiResponse<Attendance>> checkOut(@Body CheckOutRequest request);

    @GET("attendance/employee/{employeeId}")
    Call<ApiResponse<AttendanceListData>> getEmployeeAttendance(
        @Path("employeeId") String employeeId
    );

    @GET("attendance/employee/{employeeId}/date-range")
    Call<ApiResponse<AttendanceListData>> getAttendanceByDateRange(
        @Path("employeeId") String employeeId,
        @Query("startDate") String startDate,
        @Query("endDate") String endDate
    );

    // ==================== NOTIFICATIONS ====================

    @GET("notifications")
    Call<ApiResponse<NotificationListData>> getNotifications();

    @PUT("notifications/{id}")
    Call<ApiResponse<Notification>> markNotificationAsRead(@Path("id") String id);

    @PUT("notifications/mark-all-read")
    Call<ApiResponse<Void>> markAllNotificationsAsRead();

    @DELETE("notifications/{id}")
    Call<ApiResponse<Void>> deleteNotification(@Path("id") String id);

    // ==================== MESSAGES ====================

    @GET("messages")
    Call<ApiResponse<MessageListData>> getConversations();

    @POST("messages")
    Call<ApiResponse<Message>> sendMessage(@Body SendMessageRequest request);

    @GET("messages/conversation/{userId}")
    Call<ApiResponse<MessageListData>> getConversationWithUser(
        @Path("userId") String userId
    );
}
```

---

### 3. Create Retrofit Client

**RetrofitClient.java**

```java
import android.content.Context;
import android.content.SharedPreferences;
import okhttp3.*;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import java.io.IOException;

public class RetrofitClient {
    private static final String BASE_URL = "http://10.0.2.2:5000/api/v1/"; // For Android Emulator
    // Use "http://localhost:5000/api/v1/" for physical device on same network

    private static RetrofitClient instance;
    private Retrofit retrofit;
    private Context context;

    private RetrofitClient(Context context) {
        this.context = context.getApplicationContext();

        // Logging Interceptor (for debugging)
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

        // Auth Interceptor (adds token to every request)
        Interceptor authInterceptor = new Interceptor() {
            @Override
            public Response intercept(Chain chain) throws IOException {
                Request originalRequest = chain.request();

                // Get token from SharedPreferences
                SharedPreferences prefs = context.getSharedPreferences("EMS", Context.MODE_PRIVATE);
                String token = prefs.getString("accessToken", null);

                // Add token if available
                if (token != null && !token.isEmpty()) {
                    Request newRequest = originalRequest.newBuilder()
                        .header("Authorization", "Bearer " + token)
                        .build();
                    return chain.proceed(newRequest);
                }

                return chain.proceed(originalRequest);
            }
        };

        // Token Refresh Interceptor
        Authenticator authenticator = new Authenticator() {
            @Override
            public Request authenticate(Route route, Response response) throws IOException {
                // If response is 401, try to refresh token
                if (response.code() == 401) {
                    SharedPreferences prefs = context.getSharedPreferences("EMS", Context.MODE_PRIVATE);
                    String refreshToken = prefs.getString("refreshToken", null);

                    if (refreshToken != null) {
                        // Make synchronous refresh token call
                        // In production, handle this properly with a separate Retrofit instance
                        return null; // Implement token refresh logic
                    }
                }
                return null;
            }
        };

        // OkHttp Client
        OkHttpClient okHttpClient = new OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .authenticator(authenticator)
            .build();

        // Retrofit Instance
        retrofit = new Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build();
    }

    public static synchronized RetrofitClient getInstance(Context context) {
        if (instance == null) {
            instance = new RetrofitClient(context);
        }
        return instance;
    }

    public ApiService getApiService() {
        return retrofit.create(ApiService.class);
    }
}
```

---

### 4. Create Session Manager

**SessionManager.java**

```java
import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;

public class SessionManager {
    private static final String PREF_NAME = "EMS";
    private static final String KEY_ACCESS_TOKEN = "accessToken";
    private static final String KEY_REFRESH_TOKEN = "refreshToken";
    private static final String KEY_USER = "user";

    private SharedPreferences prefs;
    private SharedPreferences.Editor editor;
    private Gson gson;

    public SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
        gson = new Gson();
    }

    // Save login session
    public void saveSession(String accessToken, String refreshToken, LoginResponse.User user) {
        editor.putString(KEY_ACCESS_TOKEN, accessToken);
        editor.putString(KEY_REFRESH_TOKEN, refreshToken);
        editor.putString(KEY_USER, gson.toJson(user));
        editor.apply();
    }

    // Get access token
    public String getAccessToken() {
        return prefs.getString(KEY_ACCESS_TOKEN, null);
    }

    // Get refresh token
    public String getRefreshToken() {
        return prefs.getString(KEY_REFRESH_TOKEN, null);
    }

    // Get current user
    public LoginResponse.User getUser() {
        String userJson = prefs.getString(KEY_USER, null);
        if (userJson != null) {
            return gson.fromJson(userJson, LoginResponse.User.class);
        }
        return null;
    }

    // Check if user is logged in
    public boolean isLoggedIn() {
        return getAccessToken() != null;
    }

    // Clear session (logout)
    public void clearSession() {
        editor.clear();
        editor.apply();
    }

    // Update access token
    public void updateAccessToken(String token) {
        editor.putString(KEY_ACCESS_TOKEN, token);
        editor.apply();
    }
}
```

---

### 5. Example: Login Activity

**LoginActivity.java**

```java
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail, etPassword;
    private Button btnLogin;
    private ProgressBar progressBar;

    private ApiService apiService;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Initialize views
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);

        // Initialize API and Session
        apiService = RetrofitClient.getInstance(this).getApiService();
        sessionManager = new SessionManager(this);

        // Check if already logged in
        if (sessionManager.isLoggedIn()) {
            goToDashboard();
            return;
        }

        // Login button click
        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                login();
            }
        });
    }

    private void login() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        // Validation
        if (email.isEmpty()) {
            etEmail.setError("Email/Username is required");
            etEmail.requestFocus();
            return;
        }

        if (password.isEmpty()) {
            etPassword.setError("Password is required");
            etPassword.requestFocus();
            return;
        }

        // Show loading
        setLoading(true);

        // Make API call
        LoginRequest request = new LoginRequest(email, password);
        Call<LoginResponse> call = apiService.login(request);

        call.enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                setLoading(false);

                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse loginResponse = response.body();
                    LoginResponse.Data data = loginResponse.getData();

                    // Save session
                    sessionManager.saveSession(
                        data.getAccessToken(),
                        data.getRefreshToken(),
                        data.getUser()
                    );

                    Toast.makeText(LoginActivity.this,
                        "Welcome " + data.getUser().getName(),
                        Toast.LENGTH_SHORT).show();

                    goToDashboard();
                } else {
                    Toast.makeText(LoginActivity.this,
                        "Login failed: " + response.message(),
                        Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                setLoading(false);
                Toast.makeText(LoginActivity.this,
                    "Network error: " + t.getMessage(),
                    Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setLoading(boolean isLoading) {
        if (isLoading) {
            progressBar.setVisibility(View.VISIBLE);
            btnLogin.setEnabled(false);
        } else {
            progressBar.setVisibility(View.GONE);
            btnLogin.setEnabled(true);
        }
    }

    private void goToDashboard() {
        Intent intent = new Intent(LoginActivity.this, DashboardActivity.class);
        startActivity(intent);
        finish();
    }
}
```

---

### 6. Example: Employee List Activity

**EmployeeListActivity.java**

```java
import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.List;

public class EmployeeListActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private EmployeeAdapter adapter;
    private List<Employee> employeeList;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_employee_list);

        recyclerView = findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        employeeList = new ArrayList<>();
        adapter = new EmployeeAdapter(employeeList);
        recyclerView.setAdapter(adapter);

        apiService = RetrofitClient.getInstance(this).getApiService();

        loadEmployees();
    }

    private void loadEmployees() {
        Call<ApiResponse<EmployeeListData>> call = apiService.getEmployees(1, 50, null);

        call.enqueue(new Callback<ApiResponse<EmployeeListData>>() {
            @Override
            public void onResponse(Call<ApiResponse<EmployeeListData>> call,
                                 Response<ApiResponse<EmployeeListData>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    EmployeeListData data = response.body().getData();
                    employeeList.clear();
                    employeeList.addAll(data.getEmployees());
                    adapter.notifyDataSetChanged();
                } else {
                    Toast.makeText(EmployeeListActivity.this,
                        "Failed to load employees",
                        Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<EmployeeListData>> call, Throwable t) {
                Toast.makeText(EmployeeListActivity.this,
                    "Network error: " + t.getMessage(),
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
}
```

---

### 7. Example: Check-In with GPS

**CheckInActivity.java**

```java
import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnSuccessListener;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CheckInActivity extends AppCompatActivity {

    private static final int LOCATION_PERMISSION_CODE = 1;
    private Button btnCheckIn, btnCheckOut;
    private FusedLocationProviderClient fusedLocationClient;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_check_in);

        btnCheckIn = findViewById(R.id.btnCheckIn);
        btnCheckOut = findViewById(R.id.btnCheckOut);

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        apiService = RetrofitClient.getInstance(this).getApiService();

        btnCheckIn.setOnClickListener(v -> checkIn());
        btnCheckOut.setOnClickListener(v -> checkOut());
    }

    private void checkIn() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            // Request permission
            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                LOCATION_PERMISSION_CODE);
            return;
        }

        fusedLocationClient.getLastLocation()
            .addOnSuccessListener(this, new OnSuccessListener<Location>() {
                @Override
                public void onSuccess(Location location) {
                    if (location != null) {
                        CheckInRequest request = new CheckInRequest(
                            location.getLatitude(),
                            location.getLongitude()
                        );

                        Call<ApiResponse<Attendance>> call = apiService.checkIn(request);
                        call.enqueue(new Callback<ApiResponse<Attendance>>() {
                            @Override
                            public void onResponse(Call<ApiResponse<Attendance>> call,
                                                 Response<ApiResponse<Attendance>> response) {
                                if (response.isSuccessful()) {
                                    Toast.makeText(CheckInActivity.this,
                                        response.body().getMessage(),
                                        Toast.LENGTH_SHORT).show();
                                } else {
                                    Toast.makeText(CheckInActivity.this,
                                        "Check-in failed",
                                        Toast.LENGTH_SHORT).show();
                                }
                            }

                            @Override
                            public void onFailure(Call<ApiResponse<Attendance>> call, Throwable t) {
                                Toast.makeText(CheckInActivity.this,
                                    "Error: " + t.getMessage(),
                                    Toast.LENGTH_SHORT).show();
                            }
                        });
                    } else {
                        Toast.makeText(CheckInActivity.this,
                            "Unable to get location",
                            Toast.LENGTH_SHORT).show();
                    }
                }
            });
    }

    private void checkOut() {
        // Similar to checkIn but call apiService.checkOut(request)
    }
}
```

---

### 8. Supporting Classes

**CheckInRequest.java**

```java
public class CheckInRequest {
    private double latitude;
    private double longitude;

    public CheckInRequest(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}
```

**CheckOutRequest.java**

```java
public class CheckOutRequest {
    private double latitude;
    private double longitude;

    public CheckOutRequest(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}
```

---

### 9. Socket.IO for Real-time (Android)

**SocketManager.java**

```java
import android.content.Context;
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
import org.json.JSONException;
import org.json.JSONObject;
import java.net.URISyntaxException;

public class SocketManager {
    private static SocketManager instance;
    private Socket socket;
    private Context context;

    private SocketManager(Context context) {
        this.context = context.getApplicationContext();
    }

    public static synchronized SocketManager getInstance(Context context) {
        if (instance == null) {
            instance = new SocketManager(context);
        }
        return instance;
    }

    public void connect(String token) {
        try {
            IO.Options options = new IO.Options();
            options.auth = new java.util.HashMap<String, String>() {{
                put("token", token);
            }};

            socket = IO.socket("http://10.0.2.2:5000", options);

            socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    System.out.println("Socket connected!");
                }
            });

            socket.on("notification", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    JSONObject data = (JSONObject) args[0];
                    try {
                        String title = data.getString("title");
                        String message = data.getString("message");
                        // Show notification to user
                        showNotification(title, message);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            });

            socket.on("message", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    JSONObject data = (JSONObject) args[0];
                    // Handle new message
                }
            });

            socket.connect();

        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    public void disconnect() {
        if (socket != null) {
            socket.disconnect();
            socket.off();
        }
    }

    public void sendMessage(String receiverId, String content) {
        try {
            JSONObject data = new JSONObject();
            data.put("receiverId", receiverId);
            data.put("content", content);
            socket.emit("send-message", data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void joinRoom(String conversationId) {
        try {
            JSONObject data = new JSONObject();
            data.put("conversationId", conversationId);
            socket.emit("join-room", data);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void showNotification(String title, String message) {
        // Implement Android notification
    }
}
```

---

### 10. Important Android Notes

#### Network Security Config

For Android 9+ (API 28+), add network security config to allow HTTP connections in development:

Create `res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

Add to `AndroidManifest.xml`:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

#### URL for Different Environments

```java
// Android Emulator → Backend on PC
private static final String BASE_URL = "http://10.0.2.2:5000/api/v1/";

// Physical Device → Backend on PC (same WiFi)
private static final String BASE_URL = "http://192.168.1.100:5000/api/v1/";

// Production
private static final String BASE_URL = "https://api.yourapp.com/api/v1/";
```

#### Testing with Postman/Browser

- Emulator: `http://10.0.2.2:5000`
- Physical Device: Find your PC's IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

---

### 11. Complete Example Flow

**1. Application Class (Initialize once)**

```java
public class EMSApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();

        // Initialize Retrofit
        RetrofitClient.getInstance(this);

        // Initialize Socket if logged in
        SessionManager sessionManager = new SessionManager(this);
        if (sessionManager.isLoggedIn()) {
            String token = sessionManager.getAccessToken();
            SocketManager.getInstance(this).connect(token);
        }
    }
}
```

**2. Login → Dashboard → Feature**

```java
// In LoginActivity after successful login:
SocketManager.getInstance(this).connect(accessToken);
startActivity(new Intent(this, DashboardActivity.class));

// In any activity, make API calls:
apiService.getEmployees(1, 10, null).enqueue(callback);

// On Logout:
sessionManager.clearSession();
SocketManager.getInstance(this).disconnect();
```

---

## 🌐 Socket.IO Events (Real-time)

### Connection

```javascript
import io from 'socket.io-client'

const token = localStorage.getItem('accessToken')

// Production URL
const socket = io('https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net', {
  // For local development: 'http://localhost:5000'
  auth: { token }
})

socket.on('connect', () => {
  console.log('Connected to server')
})
```

### Available Events

**Emit (Send to server):**

- `join-room` - Join a chat room
- `leave-room` - Leave a chat room
- `send-message` - Send a message
- `typing` - User is typing
- `stop-typing` - User stopped typing

**Listen (Receive from server):**

- `notification` - New notification
- `message` - New message received
- `user-typing` - Someone is typing
- `user-stopped-typing` - Someone stopped typing
- `error` - Socket error

### Example: Real-time Chat

```javascript
// Join a conversation
socket.emit('join-room', { conversationId: 'user1-user2' })

// Send message
socket.emit('send-message', {
  receiverId: 'user2',
  content: 'Hello!'
})

// Listen for messages
socket.on('message', (message) => {
  console.log('New message:', message)
  // Update your UI
})

// Show typing indicator
socket.emit('typing', { conversationId: 'user1-user2' })

socket.on('user-typing', (data) => {
  console.log(`${data.userId} is typing...`)
})
```

---

## 🎓 Quick Tips

### 1. Always Check User Role

```javascript
const user = JSON.parse(localStorage.getItem('user'))

if (user.role === 'admin') {
  // Show admin features
}
```

### 2. Format Dates

```javascript
const date = new Date(employee.createdAt)
console.log(date.toLocaleDateString()) // "10/31/2024"
```

### 3. Handle File Downloads (CSV/PDF)

```javascript
async function downloadReport() {
  const response = await api.post(
    '/reports/attendance/export',
    {
      format: 'csv',
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    {
      responseType: 'blob' // Important!
    }
  )

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'attendance-report.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
}
```

### 4. Debounce Search

```javascript
import { useState, useEffect } from 'react'

function SearchEmployees() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search) {
        const response = await api.get(`/employees?search=${search}`)
        setResults(response.data.data.employees)
      }
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [search])

  return (
    <input type='text' placeholder='Search employees...' value={search} onChange={(e) => setSearch(e.target.value)} />
  )
}
```

---

## 🔒 Security Best Practices

1. **Never commit tokens to Git**

   ```javascript
   // ❌ Bad
   const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

   // ✅ Good
   const token = localStorage.getItem('accessToken')
   ```

2. **Always validate on frontend too**

   ```javascript
   if (!email.includes('@')) {
     alert('Invalid email')
     return
   }
   ```

3. **Clear sensitive data on logout**

   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```

4. **Use HTTPS in production**
   ```javascript
   const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://api.yourapp.com' : 'http://localhost:5000'
   ```

---

## 📞 Need Help?

- **Backend running?** Check `https://emsbackend-enh5aahkg4dcfkfs.southeastasia-01.azurewebsites.net/api/v1` (Production) or `http://localhost:5000/api/v1` (Local)
- **Token issues?** Try refreshing or logging in again
- **CORS errors?** Backend should handle this, but check browser console
- **Network errors?** Check if backend is accessible

---

## 🎉 You're Ready!

You now have everything you need to integrate with the EMS backend. Start with:

1. ✅ Set up authentication (login/logout)
2. ✅ Create your Axios instance
3. ✅ Build one feature at a time
4. ✅ Test with the seed data credentials

**Test Credentials:**

```
Admin:
  Username: admin
  Password: Admin@123

Manager:
  Username: michael.manager
  Password: Manager@123

Employee:
  Username: alice.johnson
  Password: Employee@123
```

Good luck! 🚀
