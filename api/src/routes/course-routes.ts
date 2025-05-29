import { Router } from 'express';
import { CourseController } from '../controllers/course-controller';
import { verifyAuth, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// GET /courses - List all courses (all authenticated users)
router.get('/', 
  verifyAuth, 
  checkRole(['ADMIN', 'TRAINER', 'PARTICIPANT']), 
  CourseController.list
);

// GET /courses/:id - Get course by ID (all authenticated users)
router.get('/:id', 
  verifyAuth, 
  checkRole(['ADMIN', 'TRAINER', 'PARTICIPANT']), 
  CourseController.getById
);

// POST /courses - Create new course (admin/trainer only)
router.post('/', 
  verifyAuth, 
  checkRole(['ADMIN', 'TRAINER']), 
  CourseController.create
);

// PUT /courses/:id - Update course (admin/trainer only)
router.put('/:id', 
  verifyAuth, 
  checkRole(['ADMIN', 'TRAINER']), 
  CourseController.update
);

// DELETE /courses/:id - Delete course (admin/trainer only)
router.delete('/:id', 
  verifyAuth, 
  checkRole(['ADMIN', 'TRAINER']), 
  CourseController.delete
);

export const courseRouter = router; 