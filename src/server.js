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

const createApp = () => {
  const app = express();

  const allowedOrigins = [
    'https://water-tracker-app-eight.vercel.app',
    ...(process.env.NODE_ENV === 'development'
      ? ['http://localhost:5173', 'http://localhost:4173']
      : []),
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin && process.env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        if (origin && allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.static('uploads'));
  app.use(cookieParser());
  app.use(logger);

  app.use('/water', waterRouter);
  app.use('/user', userRouter);
  app.use('/auth', authRouter);
  app.use('/api-docs', swaggerDocs());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const setupServer = () => {
  const app = createApp();
  const port = Number(getEnvVar('PORT', 3000));

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  return { app, server };
};

// For production - only start the server if this file is run directly
const isRunDirectly = import.meta.url === `file://${process.argv[1]}`;
if (process.env.NODE_ENV !== 'test' && isRunDirectly) {
  setupServer();
}
