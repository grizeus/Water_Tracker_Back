import { setupServer } from './server.js';

import { initMongoDb } from './db/initMongoDb.js';

import { createDirIfNotExist } from './utils/createDirIfNotExist.js';

import { TEMP_UPLOADS_DIR } from './constants/index.js';

const bootstrap = async () => {
  await createDirIfNotExist(TEMP_UPLOADS_DIR);
  await initMongoDb();
  setupServer();
};

bootstrap();
