import { PrismaClient, Prisma } from '@prisma/client';
import { 
  CreateCourseDto, 
  UpdateCourseDto, 
  CourseResponseDto, 
  CourseQueryDto,
  DeleteCourseDto,
  DeleteCourseResponseDto 
} from '../dto/course-dto';
import { CourseStatus } from '../entities/status-enums';
import { CourseEntity } from '../entities/course-entity';
import { 
  NotFoundException, 
  BadRequestException, 
  ConflictException 
} from '../exceptions';

export class CourseRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Find all courses with optional filtering and pagination
   */
  async findAll(query: CourseQueryDto = {}): Promise<{ courses: CourseResponseDto[], total: number }> {
    const { status, page = 1, limit = 10, enrolledForUserId } = query;
    
    const whereClause: Prisma.CourseWhereInput = {};

    if (status) {
      whereClause.status = status;
    }

    if (enrolledForUserId) {
      whereClause.enrollments = {
        some: {
          userId: enrolledForUserId,
          status: 'active' 
        }
      };
    }

    const [coursesData, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { enrollments: { where: { status: 'active' } } }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' }
      }),
      this.prisma.course.count({ where: whereClause })
    ]);

    const courses = coursesData.map(course => {
      const courseEntity = CourseEntity.create({
        id: course.id,
        title: course.title,
        description: course.description,
        status: course.status as CourseStatus,
        enrollmentCount: course._count.enrollments
      });
      
      return courseEntity.toJSON() as CourseResponseDto;
    });

    return { courses, total };
  }

  /**
   * Find course by ID
   */
  async findById(id: number): Promise<CourseResponseDto | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: { where: { status: 'active' } } }
        }
      }
    });

    if (!course) return null;

    const courseEntity = CourseEntity.create({
      id: course.id,
      title: course.title,
      description: course.description,
      status: course.status as CourseStatus,
      enrollmentCount: course._count.enrollments
    });

    return courseEntity.toJSON() as CourseResponseDto;
  }

  /**
   * Create new course
   */
  async create(dto: CreateCourseDto): Promise<CourseResponseDto> {
    try {
      // Validate using entity (will throw if invalid)
      const tempEntity = CourseEntity.create({
        id: 0, // temporary ID
        title: dto.title,
        description: dto.description,
        status: dto.status || CourseStatus.Active
      });

      const course = await this.prisma.course.create({
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status || CourseStatus.Active
        },
        include: {
          _count: {
            select: { enrollments: { where: { status: 'active' } } }
          }
        }
      });

      const courseEntity = CourseEntity.create({
        id: course.id,
        title: course.title,
        description: course.description,
        status: course.status as CourseStatus,
        enrollmentCount: course._count.enrollments
      });

      return courseEntity.toJSON() as CourseResponseDto;
    } catch (error) {
      if (error instanceof Error) {
        throw BadRequestException.validation('course', dto, error.message);
      }
      throw error;
    }
  }

  /**
   * Update existing course
   */
  async update(id: number, dto: UpdateCourseDto): Promise<CourseResponseDto | null> {
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
      throw NotFoundException.course(id);
    }

    try {
      // Create entity from existing data
      let courseEntity = CourseEntity.create({
        id: existingCourse.id,
        title: existingCourse.title,
        description: existingCourse.description,
        status: existingCourse.status as CourseStatus,
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
      const finalEntity = CourseEntity.create({
        id: updatedCourse.id,
        title: updatedCourse.title,
        description: updatedCourse.description,
        status: updatedCourse.status as CourseStatus,
        enrollmentCount: updatedCourse._count.enrollments
      });

      return finalEntity.toJSON() as CourseResponseDto;
    } catch (error) {
      if (error instanceof Error) {
        throw BadRequestException.courseOperation('update', error.message);
      }
      throw error;
    }
  }

  /**
   * Delete course with optional force deletion
   */
  async delete(dto: DeleteCourseDto): Promise<DeleteCourseResponseDto | null> {
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
      throw NotFoundException.course(id);
    }

    // Create entity to check business rules
    const courseEntity = CourseEntity.create({
      id: course.id,
      title: course.title,
      description: course.description,
      status: course.status as CourseStatus,
      enrollmentCount: course._count.enrollments
    });

    // Check if course can be deleted
    if (!courseEntity.canBeDeleted() && !force) {
      throw ConflictException.courseHasEnrollments(id, courseEntity.enrollmentCount);
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      let processedCount = 0;

      if (force) {
        // Delete all enrollments for this course
        const deleteResult = await tx.enrollment.deleteMany({ where: { courseId: id } });
        processedCount = deleteResult.count;
      } else if (courseEntity.hasActiveEnrollments()) {
        // Cancel active enrollments
        const cancelResult = await tx.enrollment.updateMany({
          where: { courseId: id, status: 'active' },
          data: { status: 'cancelled' }
        });
        processedCount = cancelResult.count;
      }

      // Delete the course
      await tx.course.delete({ where: { id } });

      return processedCount;
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
  async count(query: CourseQueryDto = {}): Promise<number> {
    const { status } = query;
    
    return this.prisma.course.count({
      where: status ? { status } : undefined
    });
  }

  /**
   * Check if course exists
   */
  async exists(id: number): Promise<boolean> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true }
    });
    return !!course;
  }

  /**
   * Get paginated courses for admin
   */
  async findAllPaginated(page: number, limit: number, status?: string): Promise<CourseResponseDto[]> {
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
      const courseEntity = CourseEntity.create({
        id: course.id,
        title: course.title,
        description: course.description,
        status: course.status as CourseStatus,
        enrollmentCount: course._count.enrollments
      });

      return courseEntity.toJSON() as CourseResponseDto;
    });
  }

  /**
   * Count courses by status
   */
  async countByStatus(status: string): Promise<number> {
    return this.prisma.course.count({
      where: { status }
    });
  }
} 