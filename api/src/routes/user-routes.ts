import { Router } from 'express';
import { UserController } from '../controllers/user-controller';
import { verifyAuth, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// GET /users/me - Get current user profile (all authenticated users)
router.get('/me', 
  verifyAuth, 
  UserController.getCurrentUser
);

// GET /users/:id - Get user by ID (admin/trainer only, or own profile)
router.get('/:id', 
  verifyAuth, 
  UserController.getUserById
);

// PUT /users/:id - Update user profile (admin only, or own profile)
router.put('/:id', 
  verifyAuth, 
  UserController.updateUser
);

// PUT /users/me/password - Change current user's password (all authenticated users)
router.put('/me/password', 
  verifyAuth, 
  UserController.changePassword
);

// DELETE /users/:id - Delete user account (admin only, or own account)
router.delete('/:id', 
  verifyAuth, 
  UserController.deleteUser
);

// GET /users/:id/can-delete - Check if user can be deleted (admin only)
router.get('/:id/can-delete', 
  verifyAuth, 
  checkRole(['ADMIN']), 
  UserController.canUserBeDeleted
);

export const userRouter = router; 