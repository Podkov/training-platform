"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user-controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// GET /users/me - Get current user profile (all authenticated users)
router.get('/me', auth_middleware_1.verifyAuth, user_controller_1.UserController.getCurrentUser);
// GET /users/:id - Get user by ID (admin/trainer only, or own profile)
router.get('/:id', auth_middleware_1.verifyAuth, user_controller_1.UserController.getUserById);
// PUT /users/:id - Update user profile (admin only, or own profile)
router.put('/:id', auth_middleware_1.verifyAuth, user_controller_1.UserController.updateUser);
// PUT /users/me/password - Change current user's password (all authenticated users)
router.put('/me/password', auth_middleware_1.verifyAuth, user_controller_1.UserController.changePassword);
// DELETE /users/:id - Delete user account (admin only, or own account)
router.delete('/:id', auth_middleware_1.verifyAuth, user_controller_1.UserController.deleteUser);
// GET /users/:id/can-delete - Check if user can be deleted (admin only)
router.get('/:id/can-delete', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['ADMIN']), user_controller_1.UserController.canUserBeDeleted);
exports.userRouter = router;
