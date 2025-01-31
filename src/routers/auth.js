// import { authenticate } from './middlewares/authenticate.js';

import { Router } from 'express';

import * as authControllers from '../controllers/auth.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { validateBody } from '../middlewares/validateBody.js';
// import {
// // імпорт схем для валідації полів

// } from '../validation/auth.js';

const authRouter = Router();

authRouter.post(
  '/signup',
  validateBody(),
  ctrlWrapper(authControllers.registerController),
);

authRouter.post(
  '/signin',
  validateBody(),
  ctrlWrapper(authControllers.loginController),
);

authRouter.post(
  '/refresh',
  ctrlWrapper(authControllers.refreshTokenController),
);
// не забути додати мідл вару authenticate до  '/refresh'
authRouter.post('/logout', ctrlWrapper(authControllers.logoutController));

export default authRouter;
