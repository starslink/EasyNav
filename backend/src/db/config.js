import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  type: process.env.DB_TYPE || 'sqlite',
  sqlite: {
    filename: process.env.DB_NAME || 'database.sqlite'
  },
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'nav_portal'
  }
};