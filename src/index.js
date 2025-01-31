import { setupServer } from './server.js';
import { initMondoDb } from './db/initMondoDb.js';

const bootstrap = async () => {
  await initMondoDb();
  setupServer();
};

bootstrap();
