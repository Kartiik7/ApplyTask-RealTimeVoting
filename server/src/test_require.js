try {
  console.log('Attempting to require AppError from ./shared/utils/AppError...');
  const AppError = require('./shared/utils/AppError');
  console.log('Success! AppError loaded:', typeof AppError);
} catch (error) {
  console.error('Failed to load AppError:', error.message);
}

try {
  console.log('Attempting to require error.middleware from ./shared/infra/http/middleware/error.middleware...');
  const errorHandler = require('./shared/infra/http/middleware/error.middleware');
  console.log('Success! errorHandler loaded:', typeof errorHandler);
} catch (error) {
  console.error('Failed to load errorHandler:', error.message);
  console.error(error.stack);
}
