"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin-controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All admin routes require ADMIN role
const adminOnly = [auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['ADMIN'])];
// GET /admin/users - Get all users with pagination
router.get('/users', ...adminOnly, admin_controller_1.AdminController.getAllUsers);
// PUT /admin/users/:id/role - Change user role
router.put('/users/:id/role', ...adminOnly, admin_controller_1.AdminController.changeUserRole);
// GET /admin/stats - Get admin dashboard statistics
router.get('/stats', ...adminOnly, admin_controller_1.AdminController.getStats);
// GET /admin/courses - Get all courses for admin panel
router.get('/courses', ...adminOnly, admin_controller_1.AdminController.getAllCourses);
// GET /admin/enrollments - Get all enrollments for admin panel
router.get('/enrollments', ...adminOnly, admin_controller_1.AdminController.getAllEnrollments);
// POST /admin/users/:id/force-delete - Force delete user
router.post('/users/:id/force-delete', ...adminOnly, admin_controller_1.AdminController.forceDeleteUser);
// POST /admin/courses/:id/force-delete - Force delete course
router.post('/courses/:id/force-delete', ...adminOnly, admin_controller_1.AdminController.forceDeleteCourse);
exports.adminRouter = router;
