import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserService } from '../services/user-service';
import { CourseService } from '../services/course-service';
import { EnrollmentService } from '../services/enrollment-service';
import { ChangeUserRoleDto, CreateUserByAdminDto } from '../dto/admin-dto';
import { UserResponseDto } from '../dto/user-dto';
import { JwtPayload } from '../utils/jwt.utils';
import { formatErrorResponse, getHttpStatusCode } from '../exceptions';

const prisma = new PrismaClient();
const userService = new UserService(prisma);
const courseService = new CourseService(prisma);
const enrollmentService = new EnrollmentService(prisma);

export class AdminController {
  /**
   * GET /admin/users - Get all users with pagination (admin only)
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const users = await userService.getAllUsersForAdmin(page, limit, currentUser);
      res.json(users);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * PUT /admin/users/:id/role - Change user role (admin only)
   */
  static async changeUserRole(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const userId = parseInt(req.params.id);
      const { newRole } = req.body;

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const dto: ChangeUserRoleDto = { userId, newRole };
      const user = await userService.changeUserRole(dto, currentUser);
      
      res.json(user);
    } catch (error) {
      console.error('[ADMIN ERROR] Change User Role Failed:', error);
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /admin/stats - Get admin dashboard statistics (admin only)
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      
      // Get stats from different services
      const [userStats, courseStats, enrollmentStats] = await Promise.all([
        userService.getUserStats(currentUser),
        courseService.getCourseStats(currentUser),
        enrollmentService.getEnrollmentStats(currentUser)
      ]);

      const stats = {
        users: userStats,
        courses: courseStats,
        enrollments: enrollmentStats,
        generatedAt: new Date().toISOString()
      };

      res.json(stats);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /admin/courses - Get all courses for admin panel (admin only)
   */
  static async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string;

      const query = { page, limit, status: status as any }; // Will be validated by service layer
      const courses = await courseService.getAllCoursesForAdmin(query, currentUser);
      
      res.json(courses);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /admin/enrollments - Get all enrollments for admin panel (admin only)
   */
  static async getAllEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const enrollments = await enrollmentService.getAllEnrollmentsForAdmin(page, limit, currentUser);
      res.json(enrollments);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * POST /admin/users/:id/force-delete - Force delete user (admin only)
   */
  static async forceDeleteUser(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const result = await userService.forceDeleteUser(userId, currentUser);
      res.json(result);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * POST /admin/courses/:id/force-delete - Force delete course (admin only)
   */
  static async forceDeleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const courseId = parseInt(req.params.id);

      if (isNaN(courseId)) {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
      }

      await courseService.deleteCourse({ id: courseId, force: true }, currentUser);
      res.status(204).send();
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * POST /admin/users - Create a new user by an administrator
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const { email, password, role } = req.body;

      const dto: CreateUserByAdminDto = { email, password, role };
      const newUser: UserResponseDto = await userService.createUserByAdmin(dto, currentUser);
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error('[ADMIN ERROR] Create User Failed:', error);
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }
} 