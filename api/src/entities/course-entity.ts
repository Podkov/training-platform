import { CourseStatus } from './status-enums';

/**
 * Course domain entity with business logic
 * Encapsulates course-related business rules and validation
 */
export class CourseEntity {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string,
    public readonly status: CourseStatus,
    public readonly enrollmentCount: number = 0
  ) {
    this.validateTitle(title);
    this.validateDescription(description);
  }

  /**
   * Create new course entity from data
   */
  static create(data: {
    id: number;
    title: string;
    description: string;
    status: CourseStatus;
    enrollmentCount?: number;
  }): CourseEntity {
    return new CourseEntity(
      data.id,
      data.title,
      data.description,
      data.status,
      data.enrollmentCount || 0
    );
  }

  /**
   * Check if course is active and can accept enrollments
   */
  canAcceptEnrollments(): boolean {
    return this.status === CourseStatus.Active;
  }

  /**
   * Check if course can be deleted
   */
  canBeDeleted(): boolean {
    return this.enrollmentCount === 0;
  }

  /**
   * Check if course can be finished
   */
  canBeFinished(): boolean {
    return this.status === CourseStatus.Active;
  }

  /**
   * Get course with updated status
   */
  withStatus(newStatus: CourseStatus): CourseEntity {
    if (newStatus === CourseStatus.Finished && !this.canBeFinished()) {
      throw new Error('Cannot finish course that is not active');
    }

    return new CourseEntity(
      this.id,
      this.title,
      this.description,
      newStatus,
      this.enrollmentCount
    );
  }

  /**
   * Get course with updated enrollment count
   */
  withEnrollmentCount(count: number): CourseEntity {
    if (count < 0) {
      throw new Error('Enrollment count cannot be negative');
    }

    return new CourseEntity(
      this.id,
      this.title,
      this.description,
      this.status,
      count
    );
  }

  /**
   * Check if course has active enrollments
   */
  hasActiveEnrollments(): boolean {
    return this.enrollmentCount > 0;
  }

  /**
   * Validate course title
   */
  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Course title cannot be empty');
    }

    if (title.length < 3) {
      throw new Error('Course title must be at least 3 characters long');
    }

    if (title.length > 100) {
      throw new Error('Course title cannot exceed 100 characters');
    }
  }

  /**
   * Validate course description
   */
  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Course description cannot be empty');
    }

    if (description.length < 10) {
      throw new Error('Course description must be at least 10 characters long');
    }

    if (description.length > 1000) {
      throw new Error('Course description cannot exceed 1000 characters');
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      enrollmentCount: this.enrollmentCount
    };
  }
}
