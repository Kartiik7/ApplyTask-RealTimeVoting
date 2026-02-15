const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pollRoutes = require('./modules/polls/routes/poll.routes');
const config = require('./config');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.clientUrl }));
app.use(express.json());

// Routes
app.use('/api/polls', pollRoutes);

const globalErrorHandler = require('./shared/infra/http/middleware/error.middleware');
const AppError = require('./shared/utils/AppError');

// ... (existing code)

// Handle 404
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
