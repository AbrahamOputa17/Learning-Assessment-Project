const express = require('express');
const authRoutes = require('./auth');
const courseRoutes = require('./courses');
const quizRoutes = require('./quizzes');
const codingRoutes = require('./coding');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/quizzes', quizRoutes);
router.use('/coding', codingRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
