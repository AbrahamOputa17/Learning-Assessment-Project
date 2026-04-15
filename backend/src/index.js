require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config');
const logger = require('./utils/logger');
const { testConnection } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const AppError = require('./utils/AppError');

const app = express();

// ────────────────────────────────────────────────
// Global Middleware
// ────────────────────────────────────────────────

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.env !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// ────────────────────────────────────────────────
// API Routes
// ────────────────────────────────────────────────

app.use('/api', routes);

// ────────────────────────────────────────────────
// 404 handler
// ────────────────────────────────────────────────

app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

// ────────────────────────────────────────────────
// Global Error Handler
// ────────────────────────────────────────────────

app.use(errorHandler);

// ────────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────────

const startServer = async () => {
  try {
    await testConnection();
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on http://localhost:${config.port} [${config.env}]`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
