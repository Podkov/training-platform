"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseRouter = void 0;
const express_1 = require("express");
const course_controller_1 = require("../controllers/course-controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// GET /courses - List all courses (all authenticated users)
router.get('/', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['ADMIN', 'TRAINER', 'PARTICIPANT']), course_controller_1.CourseController.list);
// GET /courses/:id - Get course by ID (all authenticated users)
router.get('/:id', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['ADMIN', 'TRAINER', 'PARTICIPANT']), course_controller_1.CourseController.getById);
// POST /courses - Create new course (admin/trainer only)
router.post('/', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['ADMIN', 'TRAINER']), course_controller_1.CourseController.create);
// PUT /courses/:id - Update course (admin/trainer only)
router.put('/:id', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['ADMIN', 'TRAINER']), course_controller_1.CourseController.update);
// DELETE /courses/:id - Delete course (admin/trainer only)
router.delete('/:id', auth_middleware_1.verifyAuth, (0, auth_middleware_1.checkRole)(['ADMIN', 'TRAINER']), course_controller_1.CourseController.delete);
exports.courseRouter = router;
