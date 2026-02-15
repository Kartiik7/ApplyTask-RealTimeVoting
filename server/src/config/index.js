const dotenv = require('dotenv');
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in .env file");
}

const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  env: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL,
  allowedOrigins
};
