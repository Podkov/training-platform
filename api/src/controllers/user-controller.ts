import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserService } from '../services/user-service';
import { 
  UpdateUserDto, 
  DeleteUserDto,
  ChangePasswordDto
} from '../dto/user-dto';
import { JwtPayload } from '../utils/jwt.utils';
import { formatErrorResponse, getHttpStatusCode } from '../exceptions';

const prisma = new PrismaClient();
const userService = new UserService(prisma);

export class UserController {
  /**
   * GET /users/me - Get current user profile
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const user = await userService.getCurrentUser(currentUser);
      
      res.json(user);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /users/:id - Get user by ID
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const user = await userService.getUserById(id, currentUser);
      res.json(user);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * PUT /users/:id - Update user profile
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const id = parseInt(req.params.id);
      const dto: UpdateUserDto = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const user = await userService.updateUser(id, dto, currentUser);
      res.json(user);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * PUT /users/me/password - Change current user's password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const dto: ChangePasswordDto = req.body;

      const user = await userService.changePassword(dto, currentUser);
      res.json(user);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * DELETE /users/:id - Delete user account
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const id = parseInt(req.params.id);
      const force = req.query.force === 'true';
      const password = req.body.password;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const dto: DeleteUserDto = { id, password, force };
      const result = await userService.deleteUser(dto, currentUser);
      
      res.json(result);
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /users/:id/can-delete - Check if user can be deleted (helper endpoint)
   */
  static async canUserBeDeleted(req: Request, res: Response): Promise<void> {
    try {
      const currentUser = req.user as JwtPayload;
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const canDelete = await userService.canUserBeDeleted(userId, currentUser);
      res.json({ canDelete });
    } catch (error) {
      const statusCode = getHttpStatusCode(error);
      const errorResponse = formatErrorResponse(error);
      res.status(statusCode).json(errorResponse);
    }
  }
} 