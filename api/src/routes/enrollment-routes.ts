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

// GET /enrollments/courses/:courseId/history - Get course enrollment history (admin only)
router.get('/courses/:courseId/history', 
  verifyAuth, 
  checkRole(['ADMIN']), 
  EnrollmentController.getCourseEnrollmentHistory
);

// DELETE /enrollments/courses/:courseId/users/:userId/enroll - Cancel another user's enrollment (admin/trainer only)
router.delete('/courses/:courseId/users/:userId/enroll',
  verifyAuth,
  checkRole(['ADMIN','TRAINER']),
  EnrollmentController.cancelEnrollmentByAdmin
);

// DELETE /enrollments/courses/:courseId/cancel-all - Cancel all enrollments for a course (admin/trainer only)
router.delete(
  '/courses/:courseId/cancel-all',
  verifyAuth,
  checkRole(['ADMIN','TRAINER']),
  EnrollmentController.bulkCancelCourse
);

export const enrollmentRouter = router; 