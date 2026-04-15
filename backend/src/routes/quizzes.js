const express = require('express');
const { body } = require('express-validator');
const QuizController = require('../controllers/quizController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// GET /api/quizzes/course/:courseId
router.get('/course/:courseId', authenticate, QuizController.getQuizzesByCourse);

// GET /api/quizzes/:quizId
router.get('/:quizId', authenticate, QuizController.getQuiz);

// POST /api/quizzes/course/:courseId  — create quiz
router.post(
  '/course/:courseId',
  authenticate,
  authorize('instructor', 'admin'),
  [body('title').trim().notEmpty().withMessage('Quiz title is required')],
  validate,
  QuizController.createQuiz
);

// PATCH /api/quizzes/:quizId
router.patch(
  '/:quizId',
  authenticate,
  authorize('instructor', 'admin'),
  QuizController.updateQuiz
);

// DELETE /api/quizzes/:quizId
router.delete(
  '/:quizId',
  authenticate,
  authorize('instructor', 'admin'),
  QuizController.deleteQuiz
);

// POST /api/quizzes/:quizId/questions  — add question
router.post(
  '/:quizId/questions',
  authenticate,
  authorize('instructor', 'admin'),
  [
    body('questionText').trim().notEmpty().withMessage('Question text is required'),
    body('questionType')
      .optional()
      .isIn(['multiple_choice', 'true_false', 'short_answer'])
      .withMessage('Invalid question type'),
  ],
  validate,
  QuizController.addQuestion
);

// POST /api/quizzes/:quizId/attempt  — start attempt
router.post('/:quizId/attempt', authenticate, QuizController.startAttempt);

// POST /api/quizzes/attempts/:attemptId/submit  — submit attempt
router.post('/attempts/:attemptId/submit', authenticate, QuizController.submitAttempt);

// GET /api/quizzes/:quizId/attempts  — attempt history
router.get('/:quizId/attempts', authenticate, QuizController.getAttemptHistory);

module.exports = router;
