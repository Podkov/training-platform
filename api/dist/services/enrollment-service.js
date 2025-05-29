"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
const enrollment_repository_1 = require("../repositories/enrollment-repository");
const course_repository_1 = require("../repositories/course-repository");
const user_repository_1 = require("../repositories/user-repository");
const status_enums_1 = require("../entities/status-enums");
const exceptions_1 = require("../exceptions");
const user_entity_1 = require("../entities/user-entity");
class EnrollmentService {
    constructor(prisma) {
        this.enrollmentRepository = new enrollment_repository_1.EnrollmentRepository(prisma);
        this.courseRepository = new course_repository_1.CourseRepository(prisma);
        this.userRepository = new user_repository_1.UserRepository(prisma);
    }
    async enrollInCourse(dto, currentUser) {
        // Check if user exists and has participant role
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const userEntity = user_entity_1.UserEntity.create(user);
        if (!userEntity.canEnrollInCourses()) {
            throw exceptions_1.ForbiddenException.enrollmentRestriction('Only participants can enroll in courses');
        }
        // Check if course exists
        const course = await this.courseRepository.findById(dto.courseId);
        if (!course) {
            throw exceptions_1.NotFoundException.course(dto.courseId);
        }
        // Check if user is already enrolled
        const isAlreadyEnrolled = await this.enrollmentRepository.isEnrolled(currentUser.userId, dto.courseId);
        if (isAlreadyEnrolled) {
            throw exceptions_1.BadRequestException.enrollment('User is already enrolled in this course');
        }
        return this.enrollmentRepository.enroll(currentUser.userId, dto);
    }
    async cancelEnrollment(dto, currentUser) {
        // Check if user exists and has participant role
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        const userEntity = user_entity_1.UserEntity.create(user);
        if (!userEntity.canEnrollInCourses()) {
            throw exceptions_1.ForbiddenException.enrollmentRestriction('Only participants can cancel enrollments');
        }
        // Check if user is enrolled
        const isEnrolled = await this.enrollmentRepository.isEnrolled(currentUser.userId, dto.courseId);
        if (!isEnrolled) {
            throw exceptions_1.BadRequestException.enrollment('User is not enrolled in this course');
        }
        return this.enrollmentRepository.cancel(currentUser.userId, dto);
    }
    async getUserCourses(currentUser) {
        // Check if user exists
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user) {
            throw exceptions_1.NotFoundException.user(currentUser.userId);
        }
        return this.enrollmentRepository.findByUser(currentUser.userId);
    }
    // Admin/Trainer methods for managing enrollments
    async getAllEnrollments(currentUser) {
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user || (user.role !== status_enums_1.UserRole.Admin && user.role !== status_enums_1.UserRole.Trainer)) {
            throw exceptions_1.ForbiddenException.insufficientRole([status_enums_1.UserRole.Admin, status_enums_1.UserRole.Trainer], user?.role || status_enums_1.UserRole.Participant, 'view all enrollments');
        }
        return this.enrollmentRepository.findAll();
    }
    async getEnrollmentsByUser(userId, currentUser) {
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user || (user.role !== status_enums_1.UserRole.Admin && user.role !== status_enums_1.UserRole.Trainer)) {
            throw exceptions_1.ForbiddenException.insufficientRole([status_enums_1.UserRole.Admin, status_enums_1.UserRole.Trainer], user?.role || status_enums_1.UserRole.Participant, 'view user enrollments');
        }
        // Check if target user exists
        const targetUser = await this.userRepository.findById(userId);
        if (!targetUser) {
            throw exceptions_1.NotFoundException.user(userId);
        }
        return this.enrollmentRepository.findByUser(userId);
    }
    async getEnrollmentsByCourse(courseId, currentUser) {
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user || (user.role !== status_enums_1.UserRole.Admin && user.role !== status_enums_1.UserRole.Trainer)) {
            throw exceptions_1.ForbiddenException.insufficientRole([status_enums_1.UserRole.Admin, status_enums_1.UserRole.Trainer], user?.role || status_enums_1.UserRole.Participant, 'view course enrollments');
        }
        // Check if course exists
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw exceptions_1.NotFoundException.course(courseId);
        }
        return this.enrollmentRepository.findAll({ courseId });
    }
    // Admin-specific methods
    async getAllEnrollmentsForAdmin(page, limit, currentUser) {
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user || user.role !== status_enums_1.UserRole.Admin) {
            throw exceptions_1.ForbiddenException.insufficientRole([status_enums_1.UserRole.Admin], user?.role || status_enums_1.UserRole.Participant, 'view admin enrollments');
        }
        const enrollments = await this.enrollmentRepository.findAllPaginated(page, limit);
        const total = await this.enrollmentRepository.count();
        return {
            enrollments,
            total,
            page,
            limit
        };
    }
    async getEnrollmentStats(currentUser) {
        const user = await this.userRepository.findById(currentUser.userId);
        if (!user || user.role !== status_enums_1.UserRole.Admin) {
            throw exceptions_1.ForbiddenException.insufficientRole([status_enums_1.UserRole.Admin], user?.role || status_enums_1.UserRole.Participant, 'view enrollment stats');
        }
        const [total, active, cancelled] = await Promise.all([
            this.enrollmentRepository.count(),
            this.enrollmentRepository.countByStatus('active'),
            this.enrollmentRepository.countByStatus('cancelled')
        ]);
        return { total, active, cancelled };
    }
}
exports.EnrollmentService = EnrollmentService;
