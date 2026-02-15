try {
  console.log('Attempting to require app.js...');
  const app = require('./app');
  console.log('Success! app loaded');
} catch (error) {
  console.error('Failed to load app:', error.message);
  require('fs').writeFileSync('app_error.log', error.stack);
}
