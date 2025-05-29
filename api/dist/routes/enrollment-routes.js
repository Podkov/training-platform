"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollmentRouter = void 0;
const express_1 = require("express");
const enrollment_controller_1 = require("../controllers/enrollment-controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// POST /enrollments/courses/:id/enroll - Enroll in course (participants only)
router.post('/courses/:id/enroll', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['PARTICIPANT']), enrollment_controller_1.EnrollmentController.enroll);
// DELETE /enrollments/courses/:id/enroll - Cancel enrollment (participants only)
router.delete('/courses/:id/enroll', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['PARTICIPANT']), enrollment_controller_1.EnrollmentController.cancel);
// GET /enrollments/users/me/courses - Get current user's courses (all authenticated users)
router.get('/users/me/courses', auth_middleware_1.verifyAuth, enrollment_controller_1.EnrollmentController.getUserCourses);
// GET /enrollments - Get all enrollments (admin/trainer only)
router.get('/', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['ADMIN', 'TRAINER']), enrollment_controller_1.EnrollmentController.getAll);
// GET /enrollments/users/:userId/courses - Get user's courses (admin/trainer only)
router.get('/users/:userId/courses', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['ADMIN', 'TRAINER']), enrollment_controller_1.EnrollmentController.getEnrollmentsByUser);
// GET /enrollments/courses/:courseId - Get course enrollments (admin/trainer only)
router.get('/courses/:courseId', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['ADMIN', 'TRAINER']), enrollment_controller_1.EnrollmentController.getEnrollmentsByCourse);
exports.enrollmentRouter = router;
