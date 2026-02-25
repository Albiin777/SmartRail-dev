
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  FRONTEND_URL_ALT: 'http://localhost:5174'
};
