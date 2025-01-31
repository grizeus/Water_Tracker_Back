import express from 'express';
import cors from 'cors';

import { getEnvVar } from './utils/getEnvVar.js';

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const port = Number(getEnvVar('PORT', 3000));

  app.listen(port, () => console.log('Server running on 3000 port'));
};
