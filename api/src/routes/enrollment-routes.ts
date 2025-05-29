import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment-controller';
import { verifyAuth, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// POST /enrollments/courses/:id/enroll - Enroll in course (participants only)
router.post('/courses/:id/enroll', 
  verifyAuth, 
  checkRole(['PARTICIPANT']), 
  EnrollmentController.enroll
);

// DELETE /enrollments/courses/:id/enroll - Cancel enrollment (participants only)
router.delete('/courses/:id/enroll', 
  verifyAuth, 
  checkRole(['PARTICIPANT']), 
  EnrollmentController.cancel
);

// GET /enrollments/users/me/courses - Get current user's courses (all authenticated users)
router.get('/users/me/courses', 
  verifyAuth, 
  EnrollmentController.getUserCourses
);

// GET /enrollments - Get all enrollments (admin/trainer only)
router.get('/', 
  verifyAuth, 
  checkRole(['ADMIN', 'TRAINER']), 
  EnrollmentController.getAll
);

// GET /enrollments/users/:userId/courses - Get user's courses (admin/trainer only)
router.get('/users/:userId/courses', 
  verifyAuth, 
  checkRole(['ADMIN', 'TRAINER']), 
  EnrollmentController.getEnrollmentsByUser
);

// GET /enrollments/courses/:courseId - Get course enrollments (admin/trainer only)
router.get('/courses/:courseId', 
  verifyAuth, 
  checkRole(['ADMIN', 'TRAINER']), 
  EnrollmentController.getEnrollmentsByCourse
);

export const enrollmentRouter = router; 