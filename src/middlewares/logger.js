import pino from 'pino-http';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  },
  // Fallback to prevent transport issues in Docker
  wrapSerializers: true,
  // Add this to ensure the module can be resolved in Docker
  autoLogging: {
    ignore: (req) => req.url === '/health'
  }
});
