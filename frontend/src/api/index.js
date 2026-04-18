import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

export const coursesApi = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getMine: () => api.get('/courses/mine'),
  getEnrolled: () => api.get('/courses/enrolled'),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.patch(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
};

export const quizzesApi = {
  getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  getById: (quizId) => api.get(`/quizzes/${quizId}`),
  create: (courseId, data) => api.post(`/quizzes/course/${courseId}`, data),
  update: (quizId, data) => api.patch(`/quizzes/${quizId}`, data),
  delete: (quizId) => api.delete(`/quizzes/${quizId}`),
  addQuestion: (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data),
  startAttempt: (quizId) => api.post(`/quizzes/${quizId}/attempt`),
  submitAttempt: (attemptId, data) => api.post(`/quizzes/attempts/${attemptId}/submit`, data),
  getAttemptHistory: (quizId) => api.get(`/quizzes/${quizId}/attempts`),
  generateFromPdf: (quizId, formData) =>
    api.post(`/quizzes/${quizId}/generate-from-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const codingApi = {
  getLanguages: () => api.get('/coding/languages'),
  getQuizzesByCourse: (courseId) => api.get(`/coding/quizzes/course/${courseId}`),
  getQuiz: (quizId) => api.get(`/coding/quizzes/${quizId}`),
  getQuestion: (questionId) => api.get(`/coding/questions/${questionId}`),
  createQuiz: (courseId, data) => api.post(`/coding/quizzes/course/${courseId}`, data),
  updateQuiz: (quizId, data) => api.patch(`/coding/quizzes/${quizId}`, data),
  deleteQuiz: (quizId) => api.delete(`/coding/quizzes/${quizId}`),
  addQuestion: (quizId, data) => api.post(`/coding/quizzes/${quizId}/questions`, data),
  submitCode: (data) => api.post('/coding/submissions', data),
  getSubmissionResults: (id) => api.get(`/coding/submissions/${id}/results`),
  getSubmissionHistory: (questionId) => api.get(`/coding/submissions/history/${questionId}`),
  getMyScores: (courseId) => api.get(`/coding/scores/me/course/${courseId}`),
};
