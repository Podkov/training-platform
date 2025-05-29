"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const client_1 = require("@prisma/client");
const user_service_1 = require("../services/user-service");
const course_service_1 = require("../services/course-service");
const enrollment_service_1 = require("../services/enrollment-service");
const exceptions_1 = require("../exceptions");
const prisma = new client_1.PrismaClient();
const userService = new user_service_1.UserService(prisma);
const courseService = new course_service_1.CourseService(prisma);
const enrollmentService = new enrollment_service_1.EnrollmentService(prisma);
class AdminController {
    /**
     * GET /admin/users - Get all users with pagination (admin only)
     */
    static async getAllUsers(req, res) {
        try {
            const currentUser = req.user;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const users = await userService.getAllUsersForAdmin(page, limit, currentUser);
            res.json(users);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * PUT /admin/users/:id/role - Change user role (admin only)
     */
    static async changeUserRole(req, res) {
        try {
            const currentUser = req.user;
            const userId = parseInt(req.params.id);
            const { newRole } = req.body;
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }
            const dto = { userId, newRole };
            const user = await userService.changeUserRole(dto, currentUser);
            res.json(user);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * GET /admin/stats - Get admin dashboard statistics (admin only)
     */
    static async getStats(req, res) {
        try {
            const currentUser = req.user;
            // Get stats from different services
            const [userStats, courseStats, enrollmentStats] = await Promise.all([
                userService.getUserStats(currentUser),
                courseService.getCourseStats(currentUser),
                enrollmentService.getEnrollmentStats(currentUser)
            ]);
            const stats = {
                users: userStats,
                courses: courseStats,
                enrollments: enrollmentStats,
                generatedAt: new Date().toISOString()
            };
            res.json(stats);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * GET /admin/courses - Get all courses for admin panel (admin only)
     */
    static async getAllCourses(req, res) {
        try {
            const currentUser = req.user;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const status = req.query.status;
            const query = { page, limit, status: status }; // Will be validated by service layer
            const courses = await courseService.getAllCoursesForAdmin(query, currentUser);
            res.json(courses);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * GET /admin/enrollments - Get all enrollments for admin panel (admin only)
     */
    static async getAllEnrollments(req, res) {
        try {
            const currentUser = req.user;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const enrollments = await enrollmentService.getAllEnrollmentsForAdmin(page, limit, currentUser);
            res.json(enrollments);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * POST /admin/users/:id/force-delete - Force delete user (admin only)
     */
    static async forceDeleteUser(req, res) {
        try {
            const currentUser = req.user;
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }
            const result = await userService.forceDeleteUser(userId, currentUser);
            res.json(result);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * POST /admin/courses/:id/force-delete - Force delete course (admin only)
     */
    static async forceDeleteCourse(req, res) {
        try {
            const currentUser = req.user;
            const courseId = parseInt(req.params.id);
            if (isNaN(courseId)) {
                res.status(400).json({ error: 'Invalid course ID' });
                return;
            }
            await courseService.deleteCourse({ id: courseId, force: true }, currentUser);
            res.status(204).send();
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
}
exports.AdminController = AdminController;
