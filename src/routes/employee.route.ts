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

/**
 * @swagger
 * /employees:
 *   get:
 *     tags: [Employees]
 *     summary: Get all employees (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [employee, manager, admin]
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 */
router.get('/', adminOrManager, getEmployeesController)

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Get employee by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *       404:
 *         description: Employee not found
 */
router.get('/:id', adminOrManager, getEmployeeByIdController)

/**
 * @swagger
 * /employees:
 *   post:
 *     tags: [Employees]
 *     summary: Create new employee (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - password
 *               - branchId
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: password123
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "0123456789"
 *               role:
 *                 type: string
 *                 enum: [employee, manager, admin]
 *                 default: employee
 *               branchId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee created successfully
 */
router.post('/', adminOrManager, createEmployeeController)

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     tags: [Employees]
 *     summary: Update employee information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               branchId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 */
router.put('/:id', adminOrManager, updateEmployeeController)

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     tags: [Employees]
 *     summary: Delete employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 */
router.delete('/:id', adminOrManager, deleteEmployeeController)

/**
 * @swagger
 * /employees/{id}/role:
 *   put:
 *     tags: [Employees]
 *     summary: Update employee role (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [employee, manager, admin]
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.put('/:id/role', adminOnly, updateEmployeeRoleController)

export default router
