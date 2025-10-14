import { Router } from 'express'
import {
  getEmployeesController,
  getEmployeeByIdController,
  createEmployeeController,
  updateEmployeeController,
  deleteEmployeeController,
  updateEmployeeRoleController
} from '~/controllers/employee.controller'
import { authMiddleware } from '~/middleware/auth.middleware'
import { adminOnly, adminOrManager } from '~/middleware/role.middleware'

const router = Router()

router.use(authMiddleware)

// Admin và Manager có thể xem, xóa, sửa nhân viên
router.get('/', adminOrManager, getEmployeesController)
router.get('/:id', adminOrManager, getEmployeeByIdController)
router.post('/', adminOrManager, createEmployeeController)
router.put('/:id', adminOrManager, updateEmployeeController)
router.delete('/:id', adminOrManager, deleteEmployeeController)

// Chỉ Admin mới có thể phân quyền
router.put('/:id/role', adminOnly, updateEmployeeRoleController)

export default router
