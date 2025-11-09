import mongoose from 'mongoose'
import EmployeeModel from '~/models/employee.model'
import BranchModel from '~/models/branch.model'
import { BadRequestException, NotFoundException, ForbiddenException } from '~/utils/app-error'
import {
  CreateEmployeeSchemaType,
  UpdateEmployeeSchemaType,
  UpdateEmployeeRoleSchemaType,
  GetEmployeesQuerySchemaType
} from '~/validation/employee.validator'

type RequestUser = {
  _id: string
  role: 'admin' | 'manager' | 'employee'
  branchId: mongoose.Types.ObjectId
}

// Lấy danh sách nhân viên với pagination, search, filter
export const getEmployees = async (query: GetEmployeesQuerySchemaType, requestUser: RequestUser) => {
  const { page, limit, search, role, branchId, sortBy, order } = query

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {}

  // Manager chỉ xem nhân viên trong chi nhánh của mình
  if (requestUser.role === 'manager') {
    filter.branchId = requestUser.branchId
  }

  // Filter theo branchId nếu có (Admin có thể filter)
  if (branchId) {
    // Validate ObjectId format trước khi cast
    if (mongoose.Types.ObjectId.isValid(branchId)) {
      filter.branchId = new mongoose.Types.ObjectId(branchId)
    } else {
      // Nếu không phải ObjectId hợp lệ, trả về empty array
      return {
        employees: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      }
    }
  }

  // Filter theo role nếu có
  if (role) {
    filter.role = role
  }

  // Search theo name hoặc email
  if (search) {
    filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
  }

  // Build sort object
  const sort: Record<string, 1 | -1> = {}
  sort[sortBy] = order === 'asc' ? 1 : -1

  // Calculate pagination
  const skip = (page - 1) * limit

  // Execute query
  const [employees, total] = await Promise.all([
    EmployeeModel.find(filter)
      .select('-password') // Không trả về password
      .populate('branchId', 'branchName address')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    EmployeeModel.countDocuments(filter)
  ])

  return {
    employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export const getEmployeeById = async (id: string, requestUser: RequestUser) => {
  const employee = await EmployeeModel.findById(id)
    .select('-password')
    .populate('branchId', 'branchName address')
    .lean()

  if (!employee) {
    throw new NotFoundException('Employee not found')
  }

  if (requestUser.role === 'manager') {
    if (employee.branchId._id.toString() !== requestUser.branchId.toString()) {
      throw new ForbiddenException('You can only view employees in your branch')
    }
  }

  return employee
}

export const createEmployee = async (data: CreateEmployeeSchemaType, requestUser: RequestUser) => {
  const { name, username, email, password, phone, role, branchId } = data

  if (requestUser.role === 'manager') {
    if (branchId !== requestUser.branchId.toString()) {
      throw new ForbiddenException('You can only create employees in your branch')
    }
    if (role === 'admin' || role === 'manager') {
      throw new ForbiddenException('You cannot create admin or manager accounts')
    }
  }

  // Check username uniqueness
  const existingUsername = await EmployeeModel.findOne({ username })
  if (existingUsername) {
    throw new BadRequestException('Username already exists')
  }

  // Check email uniqueness (if provided)
  if (email) {
    const existingEmail = await EmployeeModel.findOne({ email })
    if (existingEmail) {
      throw new BadRequestException('Email already exists')
    }
  }

  const branch = await BranchModel.findById(branchId)
  if (!branch) {
    throw new NotFoundException('Branch not found')
  }

  const newEmployee = new EmployeeModel({
    name,
    username,
    email,
    password,
    phone,
    role,
    branchId: new mongoose.Types.ObjectId(branchId)
  })

  await newEmployee.save()

  return newEmployee.omitPassword()
}

export const updateEmployee = async (id: string, data: UpdateEmployeeSchemaType, requestUser: RequestUser) => {
  const employee = await EmployeeModel.findById(id)
  if (!employee) {
    throw new NotFoundException('Employee not found')
  }

  if (requestUser.role === 'manager') {
    if (employee.branchId.toString() !== requestUser.branchId.toString()) {
      throw new ForbiddenException('You can only update employees in your branch')
    }
  }

  // Check username uniqueness (if updating)
  if (data.username && data.username !== employee.username) {
    const existingUsername = await EmployeeModel.findOne({
      username: data.username,
      _id: { $ne: id }
    })

    if (existingUsername) {
      throw new BadRequestException('Username already exists')
    }
  }

  // Check email uniqueness (if updating)
  if (data.email && data.email !== employee.email) {
    const existingEmployee = await EmployeeModel.findOne({
      email: data.email,
      _id: { $ne: id }
    })

    if (existingEmployee) {
      throw new BadRequestException('Email already exists')
    }
  }

  if (data.branchId) {
    if (requestUser.role === 'manager') {
      throw new ForbiddenException('You cannot change employee branch')
    }

    const branch = await BranchModel.findById(data.branchId)
    if (!branch) {
      throw new NotFoundException('Branch not found')
    }
  }

  const updatedEmployee = await EmployeeModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  })
    .select('-password')
    .populate('branchId', 'branchName address')
    .lean()

  return updatedEmployee
}

export const deleteEmployee = async (id: string) => {
  const employee = await EmployeeModel.findById(id)
  if (!employee) {
    throw new NotFoundException('Employee not found')
  }

  // Có thể soft delete thay vì hard delete

  await EmployeeModel.findByIdAndDelete(id)

  return {
    message: 'Employee deleted successfully'
  }
}

export const updateEmployeeRole = async (id: string, data: UpdateEmployeeRoleSchemaType) => {
  const employee = await EmployeeModel.findById(id)
  if (!employee) {
    throw new NotFoundException('Employee not found')
  }

  employee.role = data.role
  await employee.save()

  return employee.omitPassword()
}
