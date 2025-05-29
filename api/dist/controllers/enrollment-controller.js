"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentController = void 0;
const client_1 = require("@prisma/client");
const enrollment_service_1 = require("../services/enrollment-service");
const exceptions_1 = require("../exceptions");
const prisma = new client_1.PrismaClient();
const enrollmentService = new enrollment_service_1.EnrollmentService(prisma);
class EnrollmentController {
    /**
     * POST /enrollments/courses/:id/enroll - Enroll in course
     */
    static async enroll(req, res) {
        try {
            const currentUser = req.user;
            const courseId = parseInt(req.params.id);
            if (isNaN(courseId)) {
                res.status(400).json({ error: 'Invalid course ID' });
                return;
            }
            const dto = { courseId };
            const enrollment = await enrollmentService.enrollInCourse(dto, currentUser);
            res.status(201).json(enrollment);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * DELETE /enrollments/courses/:id/enroll - Cancel enrollment
     */
    static async cancel(req, res) {
        try {
            const currentUser = req.user;
            const courseId = parseInt(req.params.id);
            if (isNaN(courseId)) {
                res.status(400).json({ error: 'Invalid course ID' });
                return;
            }
            const dto = { courseId };
            const result = await enrollmentService.cancelEnrollment(dto, currentUser);
            if (result) {
                res.json(result);
            }
            else {
                res.status(404).json({ error: 'Enrollment not found' });
            }
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * GET /enrollments/users/me/courses - Get current user's courses
     */
    static async getUserCourses(req, res) {
        try {
            const currentUser = req.user;
            const userCourses = await enrollmentService.getUserCourses(currentUser);
            res.json(userCourses);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * GET /enrollments - Get all enrollments (admin/trainer only)
     */
    static async getAll(req, res) {
        try {
            const currentUser = req.user;
            const enrollments = await enrollmentService.getAllEnrollments(currentUser);
            res.json(enrollments);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * GET /enrollments/users/:userId/courses - Get user's courses (admin/trainer only)
     */
    static async getEnrollmentsByUser(req, res) {
        try {
            const currentUser = req.user;
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }
            const userCourses = await enrollmentService.getEnrollmentsByUser(userId, currentUser);
            res.json(userCourses);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * GET /enrollments/courses/:courseId - Get course enrollments (admin/trainer only)
     */
    static async getEnrollmentsByCourse(req, res) {
        try {
            const currentUser = req.user;
            const courseId = parseInt(req.params.courseId);
            if (isNaN(courseId)) {
                res.status(400).json({ error: 'Invalid course ID' });
                return;
            }
            const enrollments = await enrollmentService.getEnrollmentsByCourse(courseId, currentUser);
            res.json(enrollments);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
}
exports.EnrollmentController = EnrollmentController;
