"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRepository = void 0;
const status_enums_1 = require("../entities/status-enums");
const course_entity_1 = require("../entities/course-entity");
const exceptions_1 = require("../exceptions");
class CourseRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Find all courses with optional filtering and pagination
     */
    async findAll(query = {}) {
        const { status, page = 1, limit = 10 } = query;
        const courses = await this.prisma.course.findMany({
            where: status ? { status } : undefined,
            include: {
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { id: 'desc' }
        });
        return courses.map(course => {
            const courseEntity = course_entity_1.CourseEntity.create({
                id: course.id,
                title: course.title,
                description: course.description,
                status: course.status,
                enrollmentCount: course._count.enrollments
            });
            return courseEntity.toJSON();
        });
    }
    /**
     * Find course by ID
     */
    async findById(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            }
        });
        if (!course)
            return null;
        const courseEntity = course_entity_1.CourseEntity.create({
            id: course.id,
            title: course.title,
            description: course.description,
            status: course.status,
            enrollmentCount: course._count.enrollments
        });
        return courseEntity.toJSON();
    }
    /**
     * Create new course
     */
    async create(dto) {
        try {
            // Validate using entity (will throw if invalid)
            const tempEntity = course_entity_1.CourseEntity.create({
                id: 0, // temporary ID
                title: dto.title,
                description: dto.description,
                status: dto.status || status_enums_1.CourseStatus.Active
            });
            const course = await this.prisma.course.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    status: dto.status || status_enums_1.CourseStatus.Active
                },
                include: {
                    _count: {
                        select: { enrollments: { where: { status: 'active' } } }
                    }
                }
            });
            const courseEntity = course_entity_1.CourseEntity.create({
                id: course.id,
                title: course.title,
                description: course.description,
                status: course.status,
                enrollmentCount: course._count.enrollments
            });
            return courseEntity.toJSON();
        }
        catch (error) {
            if (error instanceof Error) {
                throw exceptions_1.BadRequestException.validation('course', dto, error.message);
            }
            throw error;
        }
    }
    /**
     * Update existing course
     */
    async update(id, dto) {
        // First get existing course
        const existingCourse = await this.prisma.course.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            }
        });
        if (!existingCourse) {
            throw exceptions_1.NotFoundException.course(id);
        }
        try {
            // Create entity from existing data
            let courseEntity = course_entity_1.CourseEntity.create({
                id: existingCourse.id,
                title: existingCourse.title,
                description: existingCourse.description,
                status: existingCourse.status,
                enrollmentCount: existingCourse._count.enrollments
            });
            // Apply updates using entity methods (validates business rules)
            if (dto.status && dto.status !== courseEntity.status) {
                courseEntity = courseEntity.withStatus(dto.status);
            }
            // Update in database
            const updatedCourse = await this.prisma.course.update({
                where: { id },
                data: {
                    ...(dto.title && { title: dto.title }),
                    ...(dto.description && { description: dto.description }),
                    ...(dto.status && { status: dto.status })
                },
                include: {
                    _count: {
                        select: { enrollments: { where: { status: 'active' } } }
                    }
                }
            });
            // Create final entity with updated data
            const finalEntity = course_entity_1.CourseEntity.create({
                id: updatedCourse.id,
                title: updatedCourse.title,
                description: updatedCourse.description,
                status: updatedCourse.status,
                enrollmentCount: updatedCourse._count.enrollments
            });
            return finalEntity.toJSON();
        }
        catch (error) {
            if (error instanceof Error) {
                throw exceptions_1.BadRequestException.courseOperation('update', error.message);
            }
            throw error;
        }
    }
    /**
     * Delete course with optional force deletion
     */
    async delete(dto) {
        const { id, force = false } = dto;
        // Check if course exists and get enrollment count
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            }
        });
        if (!course) {
            throw exceptions_1.NotFoundException.course(id);
        }
        // Create entity to check business rules
        const courseEntity = course_entity_1.CourseEntity.create({
            id: course.id,
            title: course.title,
            description: course.description,
            status: course.status,
            enrollmentCount: course._count.enrollments
        });
        // Check if course can be deleted
        if (!courseEntity.canBeDeleted() && !force) {
            throw exceptions_1.ConflictException.courseHasEnrollments(id, courseEntity.enrollmentCount);
        }
        // Use transaction to ensure data consistency
        const result = await this.prisma.$transaction(async (tx) => {
            let enrollmentsCancelled = 0;
            // Cancel all active enrollments if any
            if (courseEntity.hasActiveEnrollments()) {
                const cancelResult = await tx.enrollment.updateMany({
                    where: {
                        courseId: id,
                        status: 'active'
                    },
                    data: { status: 'cancelled' }
                });
                enrollmentsCancelled = cancelResult.count;
            }
            // Delete the course
            await tx.course.delete({
                where: { id }
            });
            return enrollmentsCancelled;
        });
        return {
            id,
            message: `Course deleted successfully`,
            enrollmentsCancelled: result
        };
    }
    /**
     * Get total count for pagination
     */
    async count(query = {}) {
        const { status } = query;
        return this.prisma.course.count({
            where: status ? { status } : undefined
        });
    }
    /**
     * Check if course exists
     */
    async exists(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            select: { id: true }
        });
        return !!course;
    }
    /**
     * Get paginated courses for admin
     */
    async findAllPaginated(page, limit, status) {
        const skip = (page - 1) * limit;
        const courses = await this.prisma.course.findMany({
            skip,
            take: limit,
            where: status ? { status } : undefined,
            include: {
                _count: {
                    select: { enrollments: { where: { status: 'active' } } }
                }
            },
            orderBy: { id: 'desc' }
        });
        return courses.map(course => {
            const courseEntity = course_entity_1.CourseEntity.create({
                id: course.id,
                title: course.title,
                description: course.description,
                status: course.status,
                enrollmentCount: course._count.enrollments
            });
            return courseEntity.toJSON();
        });
    }
    /**
     * Count courses by status
     */
    async countByStatus(status) {
        return this.prisma.course.count({
            where: { status }
        });
    }
}
exports.CourseRepository = CourseRepository;
