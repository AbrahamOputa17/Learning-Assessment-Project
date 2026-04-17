const { query } = require('../config/database');

const CodingModel = {
  // ---- Coding Quizzes ----

  async findQuizzesByCourse(courseId) {
    const result = await query(
      `SELECT cq.*,
              COUNT(DISTINCT cqs.id) AS question_count
       FROM coding_quizzes cq
       LEFT JOIN coding_questions cqs ON cqs.coding_quiz_id = cq.id
       WHERE cq.course_id = $1
       GROUP BY cq.id
       ORDER BY cq.created_at DESC`,
      [courseId]
    );
    return result.rows;
  },

  async findQuizById(id) {
    const result = await query('SELECT * FROM coding_quizzes WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findQuizWithQuestions(id) {
    const quizResult = await query('SELECT * FROM coding_quizzes WHERE id = $1', [id]);
    const quiz = quizResult.rows[0];
    if (!quiz) return null;

    const questionsResult = await query(
      `SELECT cq.*,
              json_agg(
                json_build_object(
                  'id', tc.id,
                  'input', tc.input,
                  'expected_output', tc.expected_output,
                  'is_hidden', tc.is_hidden,
                  'order_index', tc.order_index
                ) ORDER BY tc.order_index
              ) FILTER (WHERE tc.id IS NOT NULL) AS test_cases
       FROM coding_questions cq
       LEFT JOIN test_cases tc ON tc.coding_question_id = cq.id
       WHERE cq.coding_quiz_id = $1
       GROUP BY cq.id
       ORDER BY cq.order_index`,
      [id]
    );

    quiz.questions = questionsResult.rows;
    return quiz;
  },

  async createQuiz({ courseId, title, description, timeLimit, maxAttempts }) {
    const result = await query(
      `INSERT INTO coding_quizzes (course_id, title, description, time_limit, max_attempts)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [courseId, title, description, timeLimit, maxAttempts]
    );
    return result.rows[0];
  },

  async updateQuiz(id, fields) {
    const allowed = {
      title: 'title', description: 'description',
      timeLimit: 'time_limit', maxAttempts: 'max_attempts', is_published: 'is_published',
    };
    const updates = [];
    const values = [];
    let idx = 1;

    for (const [jsKey, dbKey] of Object.entries(allowed)) {
      if (fields[jsKey] !== undefined) {
        updates.push(`${dbKey} = $${idx++}`);
        values.push(fields[jsKey]);
      }
    }

    if (updates.length === 0) return this.findQuizById(id);

    values.push(id);
    const result = await query(
      `UPDATE coding_quizzes SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async deleteQuiz(id) {
    await query('DELETE FROM coding_quizzes WHERE id = $1', [id]);
  },

  // ---- Coding Questions ----

  async findQuestionById(id) {
    const result = await query(
      `SELECT cq.*,
              json_agg(
                json_build_object(
                  'id', tc.id,
                  'input', tc.input,
                  'expected_output', tc.expected_output,
                  'is_hidden', tc.is_hidden,
                  'order_index', tc.order_index
                ) ORDER BY tc.order_index
              ) FILTER (WHERE tc.id IS NOT NULL) AS test_cases
       FROM coding_questions cq
       LEFT JOIN test_cases tc ON tc.coding_question_id = cq.id
       WHERE cq.id = $1
       GROUP BY cq.id`,
      [id]
    );
    return result.rows[0] || null;
  },

  async createQuestion({ codingQuizId, title, description, starterCode, solutionCode, language, difficulty, points, orderIndex, deadline, caWeight }) {
    const result = await query(
      `INSERT INTO coding_questions
         (coding_quiz_id, title, description, starter_code, solution_code, language, difficulty, points, order_index, deadline, ca_weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [codingQuizId, title, description, starterCode, solutionCode, language, difficulty, points, orderIndex, deadline, caWeight]
    );
    return result.rows[0];
  },

  async updateQuestion(id, fields) {
    const allowed = {
      title: 'title',
      description: 'description',
      starterCode: 'starter_code',
      solutionCode: 'solution_code',
      language: 'language',
      difficulty: 'difficulty',
      points: 'points',
      orderIndex: 'order_index',
      deadline: 'deadline',
      caWeight: 'ca_weight',
    };
    const updates = [];
    const values = [];
    let idx = 1;

    for (const [jsKey, dbKey] of Object.entries(allowed)) {
      if (fields[jsKey] !== undefined) {
        updates.push(`${dbKey} = $${idx++}`);
        values.push(fields[jsKey]);
      }
    }

    if (updates.length === 0) return this.findQuestionById(id);

    values.push(id);
    const result = await query(
      `UPDATE coding_questions SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async createTestCase({ codingQuestionId, input, expectedOutput, isHidden, orderIndex }) {
    const result = await query(
      `INSERT INTO test_cases (coding_question_id, input, expected_output, is_hidden, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [codingQuestionId, input, expectedOutput, isHidden, orderIndex]
    );
    return result.rows[0];
  },

  // ---- Code Submissions ----

  async createSubmission({ codingQuestionId, userId, code, language }) {
    const result = await query(
      `INSERT INTO code_submissions (coding_question_id, user_id, code, language)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [codingQuestionId, userId, code, language]
    );
    return result.rows[0];
  },

  async updateSubmission(id, { status, score, testResults, errorMessage, executionTimeMs, isLate, latePenalty }) {
    const result = await query(
      `UPDATE code_submissions
       SET status = $1, score = $2, test_results = $3, error_message = $4, execution_time_ms = $5,
           is_late = $6, late_penalty = $7
       WHERE id = $8
       RETURNING *`,
      [status, score, JSON.stringify(testResults || []), errorMessage, executionTimeMs,
       isLate ?? false, latePenalty ?? 0, id]
    );
    return result.rows[0];
  },

  async findSubmissionById(id) {
    const result = await query('SELECT * FROM code_submissions WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findSubmissionHistory(userId, codingQuestionId) {
    const result = await query(
      `SELECT * FROM code_submissions
       WHERE user_id = $1 AND coding_question_id = $2
       ORDER BY submitted_at DESC
       LIMIT 20`,
      [userId, codingQuestionId]
    );
    return result.rows;
  },
};

module.exports = CodingModel;
