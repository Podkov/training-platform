"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const client_1 = require("@prisma/client");
const user_service_1 = require("../services/user-service");
const exceptions_1 = require("../exceptions");
const prisma = new client_1.PrismaClient();
const userService = new user_service_1.UserService(prisma);
class UserController {
    /**
     * GET /users/me - Get current user profile
     */
    static async getCurrentUser(req, res) {
        try {
            const currentUser = req.user;
            const user = await userService.getCurrentUser(currentUser);
            res.json(user);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * GET /users/:id - Get user by ID
     */
    static async getUserById(req, res) {
        try {
            const currentUser = req.user;
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }
            const user = await userService.getUserById(id, currentUser);
            res.json(user);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * PUT /users/:id - Update user profile
     */
    static async updateUser(req, res) {
        try {
            const currentUser = req.user;
            const id = parseInt(req.params.id);
            const dto = req.body;
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }
            const user = await userService.updateUser(id, dto, currentUser);
            res.json(user);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * PUT /users/me/password - Change current user's password
     */
    static async changePassword(req, res) {
        try {
            const currentUser = req.user;
            const dto = req.body;
            const user = await userService.changePassword(dto, currentUser);
            res.json(user);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * DELETE /users/:id - Delete user account
     */
    static async deleteUser(req, res) {
        try {
            const currentUser = req.user;
            const id = parseInt(req.params.id);
            const force = req.query.force === 'true';
            const password = req.body.password;
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }
            const dto = { id, password, force };
            const result = await userService.deleteUser(dto, currentUser);
            res.json(result);
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
    /**
     * GET /users/:id/can-delete - Check if user can be deleted (helper endpoint)
     */
    static async canUserBeDeleted(req, res) {
        try {
            const currentUser = req.user;
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }
            const canDelete = await userService.canUserBeDeleted(userId, currentUser);
            res.json({ canDelete });
        }
        catch (error) {
            const statusCode = (0, exceptions_1.getHttpStatusCode)(error);
            const errorResponse = (0, exceptions_1.formatErrorResponse)(error);
            res.status(statusCode).json(errorResponse);
        }
    }
}
exports.UserController = UserController;
