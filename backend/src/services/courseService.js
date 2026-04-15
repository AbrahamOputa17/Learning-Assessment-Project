const CourseModel = require('../models/Course');
const AppError = require('../utils/AppError');

const CourseService = {
  async getAllCourses(filters) {
    return CourseModel.findAll(filters);
  },

  async getCourseById(id) {
    const course = await CourseModel.findById(id);
    if (!course) throw new AppError('Course not found', 404);
    return course;
  },

  async getInstructorCourses(instructorId) {
    return CourseModel.findByInstructor(instructorId);
  },

  async createCourse(instructorId, data) {
    return CourseModel.create({ ...data, instructorId });
  },

  async updateCourse(id, instructorId, data) {
    const course = await CourseModel.findById(id);
    if (!course) throw new AppError('Course not found', 404);
    if (course.instructor_id !== instructorId) {
      throw new AppError('Not authorized to update this course', 403);
    }
    return CourseModel.update(id, data);
  },

  async deleteCourse(id, instructorId) {
    const course = await CourseModel.findById(id);
    if (!course) throw new AppError('Course not found', 404);
    if (course.instructor_id !== instructorId) {
      throw new AppError('Not authorized to delete this course', 403);
    }
    await CourseModel.delete(id);
  },

  async enrollStudent(userId, courseId) {
    const course = await CourseModel.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);
    if (!course.is_published) throw new AppError('Course is not available for enrollment', 400);

    const result = await CourseModel.enroll(userId, courseId);
    return result || { message: 'Already enrolled' };
  },

  async getEnrolledCourses(userId) {
    return CourseModel.findEnrolled(userId);
  },
};

module.exports = CourseService;
