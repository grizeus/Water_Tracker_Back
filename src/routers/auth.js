import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';

import { authRegisterSchema, authLoginSchema } from '../validation/auth.js';

import * as authControllers from '../controllers/auth.js';

const authRouter = Router();

authRouter.post(
  '/signup',
  validateBody(authRegisterSchema),
  ctrlWrapper(authControllers.registerController),
);

authRouter.post(
  '/signin',
  validateBody(authLoginSchema),
  ctrlWrapper(authControllers.loginController),
);

authRouter.post(
  '/refresh',
  authenticate,
  ctrlWrapper(authControllers.refreshTokenController),
);

authRouter.post(
  '/logout',
  authenticate,
  ctrlWrapper(authControllers.logoutController),
);

export default authRouter;
