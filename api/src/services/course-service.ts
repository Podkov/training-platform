import { PrismaClient } from '@prisma/client';
import { CourseRepository } from '../repositories/course-repository';
import { UserRepository } from '../repositories/user-repository';
import { 
  CreateCourseDto, 
  UpdateCourseDto, 
  CourseResponseDto, 
  CourseQueryDto,
  DeleteCourseDto
} from '../dto/course-dto';
import { UserRole } from '../entities/status-enums';
import { JwtPayload } from '../utils/jwt.utils';
import { ForbiddenException, NotFoundException, BadRequestException } from '../exceptions';
import { CourseEntity } from '../entities/course-entity';

export class CourseService {
  private courseRepository: CourseRepository;
  private userRepository: UserRepository; // For permission checks

  constructor(prisma: PrismaClient) {
    this.courseRepository = new CourseRepository(prisma);
    this.userRepository = new UserRepository(prisma);
  }

  async createCourse(dto: CreateCourseDto, currentUser: JwtPayload): Promise<CourseResponseDto> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || (user.role !== UserRole.Admin && user.role !== UserRole.Trainer)) {
      throw ForbiddenException.courseManagement('create', 0); // 0 as placeholder for courseId
    }

    // Basic validation handled by DTO and entity, additional validation here if needed
    if (!dto.title || dto.title.trim().length === 0) {
      throw BadRequestException.validation('title', dto.title, 'Title cannot be empty');
    }
     if (!dto.description || dto.description.trim().length === 0) {
      throw BadRequestException.validation('description', dto.description, 'Description cannot be empty');
    }


    return this.courseRepository.create(dto);
  }

  async getAllCourses(query: CourseQueryDto, currentUser: JwtPayload): Promise<{ courses: CourseResponseDto[], total: number, page: number, limit: number }> {
    const { page = 1, limit = 10 } = query;
    // Przekazujemy całe query, aby repozytorium mogło obsłużyć np. status
    const result = await this.courseRepository.findAll(query);
    return {
      courses: result.courses,
      total: result.total,
      page,
      limit
    };
  }

  async getCourseById(id: number, currentUser: JwtPayload): Promise<CourseResponseDto> {
    // All authenticated users can view a course by ID
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw NotFoundException.course(id);
    }
    return course;
  }

  async updateCourse(id: number, dto: UpdateCourseDto, currentUser: JwtPayload): Promise<CourseResponseDto> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || (user.role !== UserRole.Admin && user.role !== UserRole.Trainer)) {
      throw ForbiddenException.courseManagement('update', id);
    }

    const existingCourse = await this.courseRepository.findById(id);
    if (!existingCourse) {
      throw NotFoundException.course(id);
    }
    
    // Create entity to use its validation logic, e.g., for status transitions
    const courseEntity = CourseEntity.create(existingCourse);
    if(dto.status && dto.status !== courseEntity.status) {
        try {
            courseEntity.withStatus(dto.status);
        } catch (error) {
            throw BadRequestException.invalidStatusTransition(courseEntity.status, dto.status, 'course');
        }
    }


    const updatedCourse = await this.courseRepository.update(id, dto);
    if (!updatedCourse) {
      // Should be caught by previous check, but as a safeguard
      throw NotFoundException.course(id); 
    }
    return updatedCourse;
  }

  async deleteCourse(dto: DeleteCourseDto, currentUser: JwtPayload): Promise<void> {
    const { id, force } = dto;
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || (user.role !== UserRole.Admin && user.role !== UserRole.Trainer)) {
      throw ForbiddenException.courseManagement('delete', id);
    }

    const courseToDelete = await this.courseRepository.findById(id);
    if (!courseToDelete) {
      throw NotFoundException.course(id);
    }
    
    const courseEntity = CourseEntity.create(courseToDelete);

    if (!force && courseEntity.hasActiveEnrollments()) {
        throw ForbiddenException.courseManagement('delete', id);
    }

    await this.courseRepository.delete({ id, force });
  }

  // Admin-specific methods
  async getAllCoursesForAdmin(query: CourseQueryDto, currentUser: JwtPayload): Promise<{ courses: CourseResponseDto[], total: number, page: number, limit: number }> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || user.role !== UserRole.Admin) {
      throw ForbiddenException.courseManagement('view admin courses', 0);
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

  async getCourseStats(currentUser: JwtPayload): Promise<{ totalCourses: number, coursesByStatus: Record<string, number> }> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || user.role !== UserRole.Admin) {
      throw ForbiddenException.courseManagement('view course stats', 0);
    }

    const [total, active, finished] = await Promise.all([
      this.courseRepository.count(),
      this.courseRepository.countByStatus('active'),
      this.courseRepository.countByStatus('finished')
    ]);

    return {
      totalCourses: total,
      coursesByStatus: {
        active: active,
        finished: finished
      }
    };
  }
} 