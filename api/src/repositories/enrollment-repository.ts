import { PrismaClient } from '@prisma/client';
import { 
  EnrollDto,
  CancelEnrollmentDto,
  EnrollmentResponseDto,
  UserCoursesResponseDto,
  EnrollmentQueryDto,
  BulkCancelEnrollmentDto,
  BulkEnrollmentResponseDto
} from '../dto/enrollment-dto';
import { EnrollmentStatus, CourseStatus } from '../entities/status-enums';
import { EnrollmentEntity } from '../entities/enrollment-entity';
import { 
  NotFoundException, 
  BadRequestException, 
  ConflictException 
} from '../exceptions';

export class EnrollmentRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Enroll user in a course
   */
  async enroll(userId: number, dto: EnrollDto): Promise<EnrollmentResponseDto> {
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
      throw ConflictException.duplicateEnrollment(userId, courseId);
    }

    // Check if course exists and is active
    const course = await this.prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw NotFoundException.course(courseId);
    }

    const courseStatus = course.status as CourseStatus;

    // Validate enrollment using entity business logic
    if (!EnrollmentEntity.canUserEnrollInCourse(userId, courseStatus)) {
      throw BadRequestException.enrollment('Cannot enroll in inactive course');
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: EnrollmentStatus.Active
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
    const enrollmentEntity = EnrollmentEntity.create({
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      status: enrollment.status as EnrollmentStatus,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        status: enrollment.course.status as CourseStatus
      }
    });

    return enrollmentEntity.toJSON() as EnrollmentResponseDto;
  }

  /**
   * Cancel user enrollment
   */
  async cancel(userId: number, dto: CancelEnrollmentDto): Promise<EnrollmentResponseDto | null> {
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
      throw NotFoundException.enrollment();
    }

    // Create entity to validate cancellation
    const enrollmentEntity = EnrollmentEntity.create({
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      status: enrollment.status as EnrollmentStatus,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        status: enrollment.course.status as CourseStatus
      }
    });

    if (!enrollmentEntity.canBeCancelled()) {
      throw BadRequestException.enrollment('Enrollment cannot be cancelled');
    }

    try {
      // Update enrollment status
      const updatedEnrollment = await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: EnrollmentStatus.Cancelled },
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
      return updatedEntity.toJSON() as EnrollmentResponseDto;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user's courses grouped by status
   */
  async findByUser(userId: number): Promise<UserCoursesResponseDto> {
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

    const activeCourses: EnrollmentResponseDto[] = [];
    const finishedCourses: EnrollmentResponseDto[] = [];

    enrollments.forEach(enrollment => {
      const enrollmentEntity = EnrollmentEntity.create({
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        status: enrollment.status as EnrollmentStatus,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          status: enrollment.course.status as CourseStatus
        }
      });

      const enrollmentDto = enrollmentEntity.toJSON() as EnrollmentResponseDto;

      if (enrollment.course.status === CourseStatus.Active) {
        activeCourses.push(enrollmentDto);
      } else {
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
  async findAll(query: EnrollmentQueryDto = {}): Promise<EnrollmentResponseDto[]> {
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
      const enrollmentEntity = EnrollmentEntity.create({
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        status: enrollment.status as EnrollmentStatus,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          status: enrollment.course.status as CourseStatus
        }
      });

      return {
        ...enrollmentEntity.toJSON(),
        createdAt: (enrollment as any).createdAt,
        updatedAt: (enrollment as any).updatedAt,
        user: {
          id: enrollment.user.id,
          email: enrollment.user.email,
          role: enrollment.user.role
        }
      } as EnrollmentResponseDto;
    });
  }

  /**
   * Bulk cancel enrollments (used when deleting courses or users)
   */
  async bulkCancel(dto: BulkCancelEnrollmentDto): Promise<BulkEnrollmentResponseDto> {
    const { userId, courseId, reason } = dto;

    if (!userId && !courseId) {
      throw BadRequestException.validation('bulk_cancel', dto, 'Either userId or courseId must be provided');
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
        status: EnrollmentStatus.Cancelled
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
  async isEnrolled(userId: number, courseId: number): Promise<boolean> {
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
  async getEnrollmentCount(courseId: number, status?: EnrollmentStatus): Promise<number> {
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
  async getUserEnrollmentCount(userId: number, status?: EnrollmentStatus): Promise<number> {
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
  async findAllPaginated(page: number, limit: number): Promise<EnrollmentResponseDto[]> {
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
      const enrollmentEntity = EnrollmentEntity.create({
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        status: enrollment.status as EnrollmentStatus,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          status: enrollment.course.status as CourseStatus
        }
      });

      return {
        ...enrollmentEntity.toJSON(),
        createdAt: (enrollment as any).createdAt,
        updatedAt: (enrollment as any).updatedAt,
        user: {
          id: enrollment.user.id,
          email: enrollment.user.email,
          role: enrollment.user.role
        }
      } as EnrollmentResponseDto;
    });
  }

  /**
   * Count total enrollments
   */
  async count(): Promise<number> {
    return this.prisma.enrollment.count();
  }

  /**
   * Count enrollments by status
   */
  async countByStatus(status: string): Promise<number> {
    return this.prisma.enrollment.count({
      where: { status }
    });
  }
}
