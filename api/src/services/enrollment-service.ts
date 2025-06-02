import { PrismaClient } from '@prisma/client';
import { EnrollmentRepository } from '../repositories/enrollment-repository';
import { CourseRepository } from '../repositories/course-repository';
import { UserRepository } from '../repositories/user-repository';
import { 
  EnrollDto,
  CancelEnrollmentDto,
  EnrollmentResponseDto,
  UserCoursesResponseDto,
  BulkEnrollmentResponseDto
} from '../dto/enrollment-dto';
import { UserRole, EnrollmentStatus } from '../entities/status-enums';
import { JwtPayload } from '../utils/jwt.utils';
import { ForbiddenException, NotFoundException, BadRequestException } from '../exceptions';
import { UserEntity } from '../entities/user-entity';

export class EnrollmentService {
  private enrollmentRepository: EnrollmentRepository;
  private courseRepository: CourseRepository;
  private userRepository: UserRepository;

  constructor(prisma: PrismaClient) {
    this.enrollmentRepository = new EnrollmentRepository(prisma);
    this.courseRepository = new CourseRepository(prisma);
    this.userRepository = new UserRepository(prisma);
  }

  async enrollInCourse(dto: EnrollDto, currentUser: JwtPayload): Promise<EnrollmentResponseDto> {
    // Check if user exists and has participant role
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user) {
      throw NotFoundException.user(currentUser.userId);
    }

    const userEntity = UserEntity.create(user);
    if (!userEntity.canEnrollInCourses()) {
      throw ForbiddenException.enrollmentRestriction('Only participants can enroll in courses');
    }

    // Check if course exists
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw NotFoundException.course(dto.courseId);
    }

    // Check if user is already enrolled
    const isAlreadyEnrolled = await this.enrollmentRepository.isEnrolled(currentUser.userId, dto.courseId);
    if (isAlreadyEnrolled) {
      throw BadRequestException.enrollment('User is already enrolled in this course');
    }

    return this.enrollmentRepository.enroll(currentUser.userId, dto);
  }

  async cancelEnrollment(dto: CancelEnrollmentDto, currentUser: JwtPayload): Promise<EnrollmentResponseDto | null> {
    // Check if user exists and has participant role
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user) {
      throw NotFoundException.user(currentUser.userId);
    }

    const userEntity = UserEntity.create(user);
    if (!userEntity.canEnrollInCourses()) {
      throw ForbiddenException.enrollmentRestriction('Only participants can cancel enrollments');
    }

    // Check if user is enrolled
    const isEnrolled = await this.enrollmentRepository.isEnrolled(currentUser.userId, dto.courseId);
    if (!isEnrolled) {
      throw BadRequestException.enrollment('User is not enrolled in this course');
    }

    return this.enrollmentRepository.cancel(currentUser.userId, dto);
  }

  async getUserCourses(currentUser: JwtPayload): Promise<UserCoursesResponseDto> {
    // Check if user exists
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user) {
      throw NotFoundException.user(currentUser.userId);
    }

    return this.enrollmentRepository.findByUser(currentUser.userId);
  }

  // Admin/Trainer methods for managing enrollments
  async getAllEnrollments(currentUser: JwtPayload): Promise<EnrollmentResponseDto[]> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || (user.role !== UserRole.Admin && user.role !== UserRole.Trainer)) {
      throw ForbiddenException.insufficientRole([UserRole.Admin, UserRole.Trainer], user?.role || UserRole.Participant, 'view all enrollments');
    }

    return this.enrollmentRepository.findAll();
  }

  async getEnrollmentsByUser(userId: number, currentUser: JwtPayload): Promise<UserCoursesResponseDto> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || (user.role !== UserRole.Admin && user.role !== UserRole.Trainer)) {
      throw ForbiddenException.insufficientRole([UserRole.Admin, UserRole.Trainer], user?.role || UserRole.Participant, 'view user enrollments');
    }

    // Check if target user exists
    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw NotFoundException.user(userId);
    }

    return this.enrollmentRepository.findByUser(userId);
  }

  async getEnrollmentsByCourse(courseId: number, currentUser: JwtPayload): Promise<EnrollmentResponseDto[]> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || (user.role !== UserRole.Admin && user.role !== UserRole.Trainer)) {
      throw ForbiddenException.insufficientRole([UserRole.Admin, UserRole.Trainer], user?.role || UserRole.Participant, 'view course enrollments');
    }

    // Check if course exists
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw NotFoundException.course(courseId);
    }

    return this.enrollmentRepository.findAll({ courseId, status: EnrollmentStatus.Active });
  }

  async getCourseEnrollmentHistory(courseId: number, currentUser: JwtPayload): Promise<EnrollmentResponseDto[]> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || user.role !== UserRole.Admin) {
      throw ForbiddenException.insufficientRole([UserRole.Admin], user?.role || UserRole.Participant, 'view course enrollment history');
    }

    // Check if course exists
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw NotFoundException.course(courseId);
    }

    // Return all enrollments (active and cancelled) for this course
    return this.enrollmentRepository.findAll({ courseId });
  }

  // Admin-specific methods
  async getAllEnrollmentsForAdmin(page: number, limit: number, currentUser: JwtPayload): Promise<{ enrollments: EnrollmentResponseDto[], total: number, page: number, limit: number }> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || user.role !== UserRole.Admin) {
      throw ForbiddenException.insufficientRole([UserRole.Admin], user?.role || UserRole.Participant, 'view admin enrollments');
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

  async getEnrollmentStats(currentUser: JwtPayload): Promise<{ totalEnrollments: number, enrollmentsByStatus: Record<string, number> }> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || user.role !== UserRole.Admin) {
      throw ForbiddenException.insufficientRole([UserRole.Admin], user?.role || UserRole.Participant, 'view enrollment stats');
    }

    const [total, active, cancelled] = await Promise.all([
      this.enrollmentRepository.count(),
      this.enrollmentRepository.countByStatus('active'),
      this.enrollmentRepository.countByStatus('cancelled')
    ]);

    return {
      totalEnrollments: total,
      enrollmentsByStatus: {
        active: active,
        cancelled: cancelled
      }
    };
  }

  async cancelEnrollmentForUser(courseId: number, targetUserId: number, currentUser: JwtPayload): Promise<EnrollmentResponseDto> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || (user.role !== UserRole.Admin && user.role !== UserRole.Trainer)) {
      throw ForbiddenException.insufficientRole([UserRole.Admin, UserRole.Trainer], user?.role || UserRole.Participant, 'cancel user enrollment');
    }

    // Check if course exists
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw NotFoundException.course(courseId);
    }

    // Cancel user's enrollment
    const dto: CancelEnrollmentDto = { courseId };
    const result = await this.enrollmentRepository.cancel(targetUserId, dto);
    if (!result) {
      throw NotFoundException.enrollment();
    }
    return result;
  }

  /**
   * Cancel all enrollments for a course (admin/trainer only)
   */
  async bulkCancelCourse(courseId: number, currentUser: JwtPayload): Promise<BulkEnrollmentResponseDto> {
    const user = await this.userRepository.findById(currentUser.userId);
    if (!user || (user.role !== UserRole.Admin && user.role !== UserRole.Trainer)) {
      throw ForbiddenException.insufficientRole([UserRole.Admin, UserRole.Trainer], user?.role || UserRole.Participant, 'cancel all enrollments for course');
    }

    // Check if course exists
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw NotFoundException.course(courseId);
    }

    // Cancel all active enrollments for this course
    const result = await this.enrollmentRepository.bulkCancel({ courseId, reason: 'Cancelled by admin' });
    return result;
  }
} 