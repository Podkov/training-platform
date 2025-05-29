"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const client_1 = require("@prisma/client");
const course_service_1 = require("../services/course-service");
const exceptions_1 = require("../exceptions");
const prisma = new client_1.PrismaClient();
const courseService = new course_service_1.CourseService(prisma);
class CourseController {
    /**
     * GET /courses - List all courses with optional filtering
     */
    static async list(req, res) {
        try {
            const currentUser = req.user;
            const query = {
                status: req.query.status, // Will be validated by service layer
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 10
            };
            const courses = await courseService.getAllCourses(query, currentUser);
            res.json(courses);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * GET /courses/:id - Get course by ID
     */
    static async getById(req, res) {
        try {
            const currentUser = req.user;
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid course ID' });
                return;
            }
            const course = await courseService.getCourseById(id, currentUser);
            res.json(course);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * POST /courses - Create new course
     */
    static async create(req, res) {
        try {
            const currentUser = req.user;
            const dto = req.body;
            const course = await courseService.createCourse(dto, currentUser);
            res.status(201).json(course);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * PUT /courses/:id - Update course
     */
    static async update(req, res) {
        try {
            const currentUser = req.user;
            const id = parseInt(req.params.id);
            const dto = req.body;
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid course ID' });
                return;
            }
            const course = await courseService.updateCourse(id, dto, currentUser);
            res.json(course);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * DELETE /courses/:id - Delete course
     */
    static async delete(req, res) {
        try {
            const currentUser = req.user;
            const id = parseInt(req.params.id);
            const force = req.query.force === 'true';
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid course ID' });
                return;
            }
            const dto = { id, force };
            await courseService.deleteCourse(dto, currentUser);
            res.status(204).send(); // No content
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
}
exports.CourseController = CourseController;
