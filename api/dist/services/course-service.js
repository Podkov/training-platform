"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const course_repository_1 = require("../repositories/course-repository");
const user_repository_1 = require("../repositories/user-repository");
const status_enums_1 = require("../entities/status-enums");
const exceptions_1 = require("../exceptions");
const course_entity_1 = require("../entities/course-entity");
class CourseService {
    constructor(prisma) {
        this.courseRepository = new course_repository_1.CourseRepository(prisma);
        this.userRepository = new user_repository_1.UserRepository(prisma);
    }
    async createCourse(dto, currentUser) {
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user || (user.role !== status_enums_1.UserRole.Admin && user.role !== status_enums_1.UserRole.Trainer)) {
            throw exceptions_1.ForbiddenException.courseManagement('create', 0); // 0 as placeholder for courseId
        }
        // Basic validation handled by DTO and entity, additional validation here if needed
        if (!dto.title || dto.title.trim().length === 0) {
            throw exceptions_1.BadRequestException.validation('title', dto.title, 'Title cannot be empty');
        }
        if (!dto.description || dto.description.trim().length === 0) {
            throw exceptions_1.BadRequestException.validation('description', dto.description, 'Description cannot be empty');
        }
        return this.courseRepository.create(dto);
    }
    async getAllCourses(query, currentUser) {
        // All authenticated users can view courses
        // Specific filtering for roles can be added here if needed
        return this.courseRepository.findAll(query);
    }
    async getCourseById(id, currentUser) {
        // All authenticated users can view a course by ID
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw exceptions_1.NotFoundException.course(id);
        }
        return course;
    }
    async updateCourse(id, dto, currentUser) {
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user || (user.role !== status_enums_1.UserRole.Admin && user.role !== status_enums_1.UserRole.Trainer)) {
            throw exceptions_1.ForbiddenException.courseManagement('update', id);
        }
        const existingCourse = await this.courseRepository.findById(id);
        if (!existingCourse) {
            throw exceptions_1.NotFoundException.course(id);
        }
        // Create entity to use its validation logic, e.g., for status transitions
        const courseEntity = course_entity_1.CourseEntity.create(existingCourse);
        if (dto.status && dto.status !== courseEntity.status) {
            try {
                courseEntity.withStatus(dto.status);
            }
            catch (error) {
                throw exceptions_1.BadRequestException.invalidStatusTransition(courseEntity.status, dto.status, 'course');
            }
        }
        const updatedCourse = await this.courseRepository.update(id, dto);
        if (!updatedCourse) {
            // Should be caught by previous check, but as a safeguard
            throw exceptions_1.NotFoundException.course(id);
        }
        return updatedCourse;
    }
    async deleteCourse(dto, currentUser) {
        const { id, force } = dto;
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user || (user.role !== status_enums_1.UserRole.Admin && user.role !== status_enums_1.UserRole.Trainer)) {
            throw exceptions_1.ForbiddenException.courseManagement('delete', id);
        }
        const courseToDelete = await this.courseRepository.findById(id);
        if (!courseToDelete) {
            throw exceptions_1.NotFoundException.course(id);
        }
        const courseEntity = course_entity_1.CourseEntity.create(courseToDelete);
        if (!force && courseEntity.hasActiveEnrollments()) {
            throw exceptions_1.ForbiddenException.courseManagement('delete', id);
        }
        await this.courseRepository.delete({ id, force });
    }
    // Admin-specific methods
    async getAllCoursesForAdmin(query, currentUser) {
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user || user.role !== status_enums_1.UserRole.Admin) {
            throw exceptions_1.ForbiddenException.courseManagement('view admin courses', 0);
        }
        const courses = await this.courseRepository.findAllPaginated(query.page || 1, query.limit || 10, query.status);
        const total = await this.courseRepository.count({ status: query.status });
        return {
            courses,
            total,
            page: query.page || 1,
            limit: query.limit || 10
        };
    }
    async getCourseStats(currentUser) {
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user || user.role !== status_enums_1.UserRole.Admin) {
            throw exceptions_1.ForbiddenException.courseManagement('view course stats', 0);
        }
        const [total, active, finished] = await Promise.all([
            this.courseRepository.count(),
            this.courseRepository.countByStatus('active'),
            this.courseRepository.countByStatus('finished')
        ]);
        return { total, active, finished };
    }
}
exports.CourseService = CourseService;
