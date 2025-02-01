import { Router } from 'express';

import * as userControllers from '../controllers/user.js';

// import { authenticate } from '../middlewares/authenticate.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { validateBody } from '../middlewares/validateBody.js';
// import {
// // імпорт схем для валідації полів

// } from '../validation/auth.js';

const userRouter = Router();

userRouter.get('/:id', ctrlWrapper(userControllers.getUserController));

userRouter.patch(
  '/:id',
  validateBody(),
  ctrlWrapper(userControllers.updateUserController),
);

userRouter.patch(
  '/:id/avatar',
  ctrlWrapper(userControllers.updateAvatarController),
);

// не забути додати мідл вару authenticate до всіх захищених маршрутів

export default userRouter;
