import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

import { userInfoSchema } from '../validation/user.js';

import * as userControllers from '../controllers/user.js';

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/', ctrlWrapper(userControllers.getUserController));

userRouter.patch(
  '/',
  validateBody(userInfoSchema),
  ctrlWrapper(userControllers.updateUserController),
);

userRouter.patch(
  '/avatar',
  upload.single('avatarURL'),
  userControllers.updateAvatarController,
);

export default userRouter;
