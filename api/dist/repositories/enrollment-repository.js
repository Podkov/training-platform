"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentRepository = void 0;
const status_enums_1 = require("../entities/status-enums");
const enrollment_entity_1 = require("../entities/enrollment-entity");
const exceptions_1 = require("../exceptions");
class EnrollmentRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Enroll user in a course
     */
    async enroll(userId, dto) {
        const { courseId } = dto;
        // Check if user is already enrolled
        const existingEnrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseId,
                status: 'active'
            }
        });
        if (existingEnrollment) {
            throw exceptions_1.ConflictException.duplicateEnrollment(userId, courseId);
        }
        // Check if course exists and is active
        const course = await this.prisma.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            throw exceptions_1.NotFoundException.course(courseId);
        }
        const courseStatus = course.status;
        // Validate enrollment using entity business logic
        if (!enrollment_entity_1.EnrollmentEntity.canUserEnrollInCourse(userId, courseStatus)) {
            throw exceptions_1.BadRequestException.enrollment('Cannot enroll in inactive course');
        }
        // Create enrollment
        const enrollment = await this.prisma.enrollment.create({
            data: {
                userId,
                courseId,
                status: status_enums_1.EnrollmentStatus.Active
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true
                    }
                }
            }
        });
        // Create entity and return as DTO
        const enrollmentEntity = enrollment_entity_1.EnrollmentEntity.create({
            id: enrollment.id,
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            status: enrollment.status,
            course: {
                id: enrollment.course.id,
                title: enrollment.course.title,
                status: enrollment.course.status
            }
        });
        return enrollmentEntity.toJSON();
    }
    /**
     * Cancel user enrollment
     */
    async cancel(userId, dto) {
        const { courseId } = dto;
        // Find active enrollment
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseId,
                status: 'active'
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true
                    }
                }
            }
        });
        if (!enrollment) {
            throw exceptions_1.NotFoundException.enrollment();
        }
        // Create entity to validate cancellation
        const enrollmentEntity = enrollment_entity_1.EnrollmentEntity.create({
            id: enrollment.id,
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            status: enrollment.status,
            course: {
                id: enrollment.course.id,
                title: enrollment.course.title,
                status: enrollment.course.status
            }
        });
        if (!enrollmentEntity.canBeCancelled()) {
            throw exceptions_1.BadRequestException.enrollment('Enrollment cannot be cancelled');
        }
        try {
            // Update enrollment status
            const updatedEnrollment = await this.prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { status: status_enums_1.EnrollmentStatus.Cancelled },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            status: true
                        }
                    }
                }
            });
            // Create updated entity using cancel method
            const updatedEntity = enrollmentEntity.cancel();
            return updatedEntity.toJSON();
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Get user's courses grouped by status
     */
    async findByUser(userId) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                userId,
                status: 'active'
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true
                    }
                }
            },
            orderBy: { id: 'desc' }
        });
        const activeCourses = [];
        const finishedCourses = [];
        enrollments.forEach(enrollment => {
            const enrollmentEntity = enrollment_entity_1.EnrollmentEntity.create({
                id: enrollment.id,
                userId: enrollment.userId,
                courseId: enrollment.courseId,
                status: enrollment.status,
                course: {
                    id: enrollment.course.id,
                    title: enrollment.course.title,
                    status: enrollment.course.status
                }
            });
            const enrollmentDto = enrollmentEntity.toJSON();
            if (enrollment.course.status === status_enums_1.CourseStatus.Active) {
                activeCourses.push(enrollmentDto);
            }
            else {
                finishedCourses.push(enrollmentDto);
            }
        });
        return {
            activeCourses,
            finishedCourses
        };
    }
    /**
     * Find enrollments with optional filtering
     */
    async findAll(query = {}) {
        const { userId, courseId, status } = query;
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                ...(userId && { userId }),
                ...(courseId && { courseId }),
                ...(status && { status })
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true
                    }
                }
            },
            orderBy: { id: 'desc' }
        });
        return enrollments.map(enrollment => {
            const enrollmentEntity = enrollment_entity_1.EnrollmentEntity.create({
                id: enrollment.id,
                userId: enrollment.userId,
                courseId: enrollment.courseId,
                status: enrollment.status,
                course: {
                    id: enrollment.course.id,
                    title: enrollment.course.title,
                    status: enrollment.course.status
                }
            });
            return enrollmentEntity.toJSON();
        });
    }
    /**
     * Bulk cancel enrollments (used when deleting courses or users)
     */
    async bulkCancel(dto) {
        const { userId, courseId, reason } = dto;
        if (!userId && !courseId) {
            throw exceptions_1.BadRequestException.validation('bulk_cancel', dto, 'Either userId or courseId must be provided');
        }
        // Get affected users before cancellation
        const affectedEnrollments = await this.prisma.enrollment.findMany({
            where: {
                ...(userId && { userId }),
                ...(courseId && { courseId }),
                status: 'active'
            },
            select: { userId: true }
        });
        const affectedUsers = [...new Set(affectedEnrollments.map(e => e.userId))];
        // Cancel enrollments
        const result = await this.prisma.enrollment.updateMany({
            where: {
                ...(userId && { userId }),
                ...(courseId && { courseId }),
                status: 'active'
            },
            data: {
                status: status_enums_1.EnrollmentStatus.Cancelled
            }
        });
        return {
            cancelled: result.count,
            message: `${result.count} enrollments cancelled. Reason: ${reason}`,
            affectedUsers
        };
    }
    /**
     * Check if user is enrolled in course
     */
    async isEnrolled(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseId,
                status: 'active'
            },
            select: { id: true }
        });
        return !!enrollment;
    }
    /**
     * Get enrollment count for a course
     */
    async getEnrollmentCount(courseId, status) {
        return this.prisma.enrollment.count({
            where: {
                courseId,
                ...(status && { status })
            }
        });
    }
    /**
     * Get user's enrollment count
     */
    async getUserEnrollmentCount(userId, status) {
        return this.prisma.enrollment.count({
            where: {
                userId,
                ...(status && { status })
            }
        });
    }
    /**
     * Get paginated enrollments for admin
     */
    async findAllPaginated(page, limit) {
        const skip = (page - 1) * limit;
        const enrollments = await this.prisma.enrollment.findMany({
            skip,
            take: limit,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { id: 'desc' }
        });
        return enrollments.map(enrollment => {
            const enrollmentEntity = enrollment_entity_1.EnrollmentEntity.create({
                id: enrollment.id,
                userId: enrollment.userId,
                courseId: enrollment.courseId,
                status: enrollment.status,
                course: {
                    id: enrollment.course.id,
                    title: enrollment.course.title,
                    status: enrollment.course.status
                }
            });
            return {
                ...enrollmentEntity.toJSON(),
                user: {
                    id: enrollment.user.id,
                    email: enrollment.user.email,
                    role: enrollment.user.role
                }
            };
        });
    }
    /**
     * Count total enrollments
     */
    async count() {
        return this.prisma.enrollment.count();
    }
    /**
     * Count enrollments by status
     */
    async countByStatus(status) {
        return this.prisma.enrollment.count({
            where: { status }
        });
    }
}
exports.EnrollmentRepository = EnrollmentRepository;
