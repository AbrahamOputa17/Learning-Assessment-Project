const CourseService = require('../services/courseService');

const CourseController = {
  async getAllCourses(req, res, next) {
    try {
      const { category, level, limit, offset } = req.query;
      const courses = await CourseService.getAllCourses({
        category,
        level,
        limit: limit ? parseInt(limit, 10) : 20,
        offset: offset ? parseInt(offset, 10) : 0,
      });
      res.json({ status: 'success', data: { courses } });
    } catch (err) {
      next(err);
    }
  },

  async getCourseById(req, res, next) {
    try {
      const course = await CourseService.getCourseById(req.params.id);
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  async getMyCourses(req, res, next) {
    try {
      const courses = await CourseService.getInstructorCourses(req.user.id);
      res.json({ status: 'success', data: { courses } });
    } catch (err) {
      next(err);
    }
  },

  async createCourse(req, res, next) {
    try {
      const course = await CourseService.createCourse(req.user.id, req.body);
      res.status(201).json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  async updateCourse(req, res, next) {
    try {
      const course = await CourseService.updateCourse(req.params.id, req.user.id, req.body);
      res.json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  },

  async deleteCourse(req, res, next) {
    try {
      await CourseService.deleteCourse(req.params.id, req.user.id);
      res.json({ status: 'success', message: 'Course deleted' });
    } catch (err) {
      next(err);
    }
  },

  async enrollInCourse(req, res, next) {
    try {
      const result = await CourseService.enrollStudent(req.user.id, req.params.id);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getEnrolledCourses(req, res, next) {
    try {
      const courses = await CourseService.getEnrolledCourses(req.user.id);
      res.json({ status: 'success', data: { courses } });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = CourseController;
