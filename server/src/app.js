const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pollRoutes = require('./modules/polls/routes/poll.routes');
const config = require('./config');

const app = express();

// Trust Proxy for production (correct IP detection behind proxies like Render)
if (config.env === 'production') {
  app.set('trust proxy', 1);
}

// Dynamic CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (origin === config.clientUrl) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
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
