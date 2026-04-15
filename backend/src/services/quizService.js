const QuizModel = require('../models/Quiz');
const CourseModel = require('../models/Course');
const AppError = require('../utils/AppError');

const QuizService = {
  async getQuizzesByCourse(courseId, user) {
    const course = await CourseModel.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);
    return QuizModel.findByCourse(courseId);
  },

  async getQuiz(quizId, includeAnswers = false) {
    const quiz = await QuizModel.findByIdWithQuestions(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);

    // Hide correct answers for students
    if (!includeAnswers) {
      quiz.questions = (quiz.questions || []).map((q) => ({
        ...q,
        options: (q.options || []).map(({ is_correct: _c, ...opt }) => opt),
      }));
    }
    return quiz;
  },

  async createQuiz(instructorId, courseId, data) {
    const course = await CourseModel.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);
    if (course.instructor_id !== instructorId) {
      throw new AppError('Not authorised to create quizzes for this course', 403);
    }
    return QuizModel.create({ courseId, ...data });
  },

  async updateQuiz(quizId, instructorId, data) {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);

    const course = await CourseModel.findById(quiz.course_id);
    if (course.instructor_id !== instructorId) {
      throw new AppError('Not authorised to update this quiz', 403);
    }
    return QuizModel.update(quizId, data);
  },

  async deleteQuiz(quizId, instructorId) {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);

    const course = await CourseModel.findById(quiz.course_id);
    if (course.instructor_id !== instructorId) {
      throw new AppError('Not authorised to delete this quiz', 403);
    }
    await QuizModel.delete(quizId);
  },

  async addQuestion(quizId, instructorId, questionData) {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);

    const course = await CourseModel.findById(quiz.course_id);
    if (course.instructor_id !== instructorId) {
      throw new AppError('Not authorised', 403);
    }

    const question = await QuizModel.createQuestion({
      quizId,
      questionText: questionData.questionText,
      questionType: questionData.questionType || 'multiple_choice',
      points: questionData.points || 1,
      orderIndex: questionData.orderIndex || 0,
    });

    if (questionData.options && questionData.options.length > 0) {
      for (let i = 0; i < questionData.options.length; i++) {
        await QuizModel.createOption({
          questionId: question.id,
          optionText: questionData.options[i].optionText,
          isCorrect: questionData.options[i].isCorrect || false,
          orderIndex: i,
        });
      }
    }

    return QuizModel.findByIdWithQuestions(quizId);
  },

  async startAttempt(quizId, userId) {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);
    if (!quiz.is_published) throw new AppError('Quiz is not available', 400);

    const attempts = await QuizModel.countAttempts(quizId, userId);
    if (quiz.max_attempts && attempts >= quiz.max_attempts) {
      throw new AppError('Maximum attempts reached', 400);
    }

    const attempt = await QuizModel.createAttempt({ quizId, userId });
    const quizData = await this.getQuiz(quizId, false);

    return { attempt, quiz: quizData };
  },

  async submitAttempt(attemptId, userId, submittedAnswers) {
    const attempt = await QuizModel.findAttempt(attemptId);
    if (!attempt) throw new AppError('Attempt not found', 404);
    if (attempt.user_id !== userId) throw new AppError('Not authorised', 403);
    if (attempt.submitted_at) throw new AppError('Attempt already submitted', 400);

    const quiz = await QuizModel.findByIdWithQuestions(attempt.quiz_id);
    let totalPoints = 0;
    let earnedPoints = 0;
    const answers = [];

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const submitted = submittedAnswers.find((a) => a.questionId === question.id);
      let isCorrect = false;
      let pointsEarned = 0;
      let selectedOptionId = null;
      let textAnswer = null;

      if (submitted) {
        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          selectedOptionId = submitted.selectedOptionId;
          const correctOption = question.options.find((o) => o.is_correct);
          isCorrect = correctOption && correctOption.id === selectedOptionId;
        } else {
          textAnswer = submitted.textAnswer;
          // Simple text comparison for short answers
          const correctOption = question.options && question.options[0];
          if (correctOption) {
            isCorrect = textAnswer &&
              textAnswer.trim().toLowerCase() === correctOption.option_text.trim().toLowerCase();
          }
        }
        if (isCorrect) pointsEarned = question.points;
      }

      earnedPoints += pointsEarned;
      answers.push({
        questionId: question.id,
        selectedOptionId,
        textAnswer,
        isCorrect,
        pointsEarned,
      });
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quiz.pass_score;

    return QuizModel.submitAttempt(attemptId, { score, passed, answers });
  },

  async getAttemptHistory(quizId, userId) {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404);
    return QuizModel.findUserAttempts(quizId, userId);
  },
};

module.exports = QuizService;
