import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CourseService } from '../services/course-service';
import { 
  CreateCourseDto, 
  UpdateCourseDto, 
  CourseQueryDto,
  DeleteCourseDto
} from '../dto/course-dto';
import { JwtPayload } from '../utils/jwt.utils';
import { formatErrorResponse, getHttpStatusCode } from '../exceptions';

const prisma = new PrismaClient();
const courseService = new CourseService(prisma);

export class CourseController {
  /**
   * GET /courses - List all courses with optional filtering
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const query: CourseQueryDto = {
        status: req.query.status as any, // Will be validated by service layer
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const courses = await courseService.getAllCourses(query, currentUser);
      res.json(courses);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /courses/:id - Get course by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
      }

      const course = await courseService.getCourseById(id, currentUser);
      res.json(course);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * POST /courses - Create new course
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const dto: CreateCourseDto = req.body;

      const course = await courseService.createCourse(dto, currentUser);
      res.status(201).json(course);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * PUT /courses/:id - Update course
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const id = parseInt(req.params.id);
      const dto: UpdateCourseDto = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
      }

      const course = await courseService.updateCourse(id, dto, currentUser);
      res.json(course);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * DELETE /courses/:id - Delete course
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const id = parseInt(req.params.id);
      const force = req.query.force === 'true';

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
      }

      const dto: DeleteCourseDto = { id, force };
      await courseService.deleteCourse(dto, currentUser);
      
      res.status(204).send(); // No content
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }
} 