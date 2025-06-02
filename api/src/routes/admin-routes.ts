import { Router } from 'express';
import { AdminController } from '../controllers/admin-controller';
import { verifyAuth, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// All admin routes require ADMIN role
const adminOnly = [verifyAuth, checkRole(['ADMIN'])];

// GET /admin/users - Get all users with pagination
router.get('/users', 
  ...adminOnly, 
  AdminController.getAllUsers
);

// POST /admin/users - Create a new user by admin
router.post('/users',
  ...adminOnly,
  AdminController.createUser
);

// PUT /admin/users/:id/role - Change user role
router.put('/users/:id/role', 
  ...adminOnly, 
  AdminController.changeUserRole
);

// GET /admin/stats - Get admin dashboard statistics
router.get('/stats', 
  ...adminOnly, 
  AdminController.getStats
);

// GET /admin/courses - Get all courses for admin panel
router.get('/courses', 
  ...adminOnly, 
  AdminController.getAllCourses
);

// GET /admin/enrollments - Get all enrollments for admin panel
router.get('/enrollments', 
  ...adminOnly, 
  AdminController.getAllEnrollments
);

// POST /admin/users/:id/force-delete - Force delete user
router.post('/users/:id/force-delete', 
  ...adminOnly, 
  AdminController.forceDeleteUser
);

// POST /admin/courses/:id/force-delete - Force delete course
router.post('/courses/:id/force-delete', 
  ...adminOnly, 
  AdminController.forceDeleteCourse
);

export const adminRouter = router; 