import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

import { userInfoSchema } from '../validation/user.js';

import * as userControllers from '../controllers/user.js';

const userRouter = Router();

userRouter.use(authenticate);

// Маршрут для отримання інформації про користувача за ID
userRouter.get('/', ctrlWrapper(userControllers.getUserController));

// Маршрут для оновлення інформації про користувача
userRouter.patch(
  '/',
  validateBody(userInfoSchema),
  ctrlWrapper(userControllers.updateUserController),
);

// Маршрут для оновлення аватара
userRouter.patch(
  '/avatar',
  upload.single('photo'),
  ctrlWrapper(userControllers.updateAvatarController),
);

export default userRouter;
