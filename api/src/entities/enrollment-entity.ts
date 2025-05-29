import { EnrollmentStatus, CourseStatus } from './status-enums';

/**
 * Enrollment domain entity with business logic
 * Encapsulates enrollment-related business rules and validation
 */
export class EnrollmentEntity {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly courseId: number,
    public readonly status: EnrollmentStatus,
    public readonly course?: {
      id: number;
      title: string;
      status: CourseStatus;
    }
  ) {
    this.validateUserId(userId);
    this.validateCourseId(courseId);
  }

  /**
   * Create new enrollment entity from data
   */
  static create(data: {
    id: number;
    userId: number;
    courseId: number;
    status: EnrollmentStatus;
    course?: {
      id: number;
      title: string;
      status: CourseStatus;
    };
  }): EnrollmentEntity {
    return new EnrollmentEntity(
      data.id,
      data.userId,
      data.courseId,
      data.status,
      data.course
    );
  }

  /**
   * Check if enrollment is active
   */
  isActive(): boolean {
    return this.status === EnrollmentStatus.Active;
  }

  /**
   * Check if enrollment is cancelled
   */
  isCancelled(): boolean {
    return this.status === EnrollmentStatus.Cancelled;
  }

  /**
   * Check if enrollment can be cancelled
   */
  canBeCancelled(): boolean {
    return this.status === EnrollmentStatus.Active;
  }

  /**
   * Check if course is still active (if course data is available)
   */
  isCourseActive(): boolean {
    return this.course?.status === CourseStatus.Active;
  }

  /**
   * Check if this is an active enrollment in an active course
   */
  isActiveInActiveCourse(): boolean {
    return this.isActive() && this.isCourseActive();
  }

  /**
   * Check if this is an active enrollment in a finished course
   */
  isActiveInFinishedCourse(): boolean {
    return this.isActive() && this.course?.status === CourseStatus.Finished;
  }

  /**
   * Get enrollment with cancelled status
   */
  cancel(): EnrollmentEntity {
    if (!this.canBeCancelled()) {
      throw new Error('Cannot cancel enrollment that is not active');
    }

    return new EnrollmentEntity(
      this.id,
      this.userId,
      this.courseId,
      EnrollmentStatus.Cancelled,
      this.course
    );
  }

  /**
   * Get enrollment with updated course data
   */
  withCourse(course: {
    id: number;
    title: string;
    status: CourseStatus;
  }): EnrollmentEntity {
    if (course.id !== this.courseId) {
      throw new Error('Course ID mismatch');
    }

    return new EnrollmentEntity(
      this.id,
      this.userId,
      this.courseId,
      this.status,
      course
    );
  }

  /**
   * Check if user can enroll in course (static method for validation)
   */
  static canUserEnrollInCourse(
    userId: number,
    courseStatus: CourseStatus,
    existingEnrollment?: EnrollmentEntity
  ): boolean {
    // User cannot enroll if already has active enrollment
    if (existingEnrollment?.isActive()) {
      return false;
    }

    // User cannot enroll in inactive course
    if (courseStatus !== CourseStatus.Active) {
      return false;
    }

    return true;
  }

  /**
   * Validate user ID
   */
  private validateUserId(userId: number): void {
    if (!userId || userId <= 0) {
      throw new Error('Invalid user ID');
    }
  }

  /**
   * Validate course ID
   */
  private validateCourseId(courseId: number): void {
    if (!courseId || courseId <= 0) {
      throw new Error('Invalid course ID');
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      courseId: this.courseId,
      status: this.status,
      course: this.course
    };
  }
}
