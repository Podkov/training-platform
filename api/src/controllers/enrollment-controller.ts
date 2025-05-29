import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { EnrollmentService } from '../services/enrollment-service';
import { 
  EnrollDto,
  CancelEnrollmentDto
} from '../dto/enrollment-dto';
import { JwtPayload } from '../utils/jwt.utils';
import { formatErrorResponse, getHttpStatusCode } from '../exceptions';

const prisma = new PrismaClient();
const enrollmentService = new EnrollmentService(prisma);

export class EnrollmentController {
  /**
   * POST /enrollments/courses/:id/enroll - Enroll in course
   */
  static async enroll(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const courseId = parseInt(req.params.id);

      if (isNaN(courseId)) {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
      }

      const dto: EnrollDto = { courseId };
      const enrollment = await enrollmentService.enrollInCourse(dto, currentUser);
      
      res.status(201).json(enrollment);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * DELETE /enrollments/courses/:id/enroll - Cancel enrollment
   */
  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const courseId = parseInt(req.params.id);

      if (isNaN(courseId)) {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
      }

      const dto: CancelEnrollmentDto = { courseId };
      const result = await enrollmentService.cancelEnrollment(dto, currentUser);
      
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Enrollment not found' });
      }
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /enrollments/users/me/courses - Get current user's courses
   */
  static async getUserCourses(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const userCourses = await enrollmentService.getUserCourses(currentUser);
      
      res.json(userCourses);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /enrollments - Get all enrollments (admin/trainer only)
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const enrollments = await enrollmentService.getAllEnrollments(currentUser);
      
      res.json(enrollments);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /enrollments/users/:userId/courses - Get user's courses (admin/trainer only)
   */
  static async getEnrollmentsByUser(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const userCourses = await enrollmentService.getEnrollmentsByUser(userId, currentUser);
      res.json(userCourses);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /enrollments/courses/:courseId - Get course enrollments (admin/trainer only)
   */
  static async getEnrollmentsByCourse(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const courseId = parseInt(req.params.courseId);

      if (isNaN(courseId)) {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
      }

      const enrollments = await enrollmentService.getEnrollmentsByCourse(courseId, currentUser);
      res.json(enrollments);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }
} 