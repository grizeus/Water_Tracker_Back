import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import waterRouter from './routers/water.js';
import userRouter from './routers/user.js';
import authRouter from './routers/auth.js';

import { getEnvVar } from './utils/getEnvVar.js';

import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { logger } from './middlewares/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

// Create and configure the Express app
const createApp = () => {
  const app = express();

  const allowedOrigins = [
    'https://water-tracker-frontend-7q65.vercel.app', 
    'http://localhost:5173', 
    'http://localhost:4173'
  ];

  // Middleware
  app.use(express.json());
  app.use(express.static('uploads'));
  app.use(cookieParser());
  app.use(logger);
  
  // CORS configuration
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // Routes
  app.use('/water', waterRouter);
  app.use('/user', userRouter);
  app.use('/auth', authRouter);
  app.use('/api-docs', swaggerDocs());

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

// Create and start the server
export const setupServer = () => {
  const app = createApp();
  const port = Number(getEnvVar('PORT', 3000));
  
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  
  return { app, server };
};

// For production - only start the server if this file is run directly
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  setupServer();
}
