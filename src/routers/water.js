import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { validateParams } from '../middlewares/validateParams.js';

import {
  waterEntrySchema,
  dailyGoalSchema,
  monthFormatSchema,
} from '../validation/water.js';

import * as waterControllers from '../controllers/water.js';

const waterRouter = Router();

waterRouter.use(authenticate);

waterRouter.post(
  '/entry',
  validateBody(waterEntrySchema),
  ctrlWrapper(waterControllers.addWaterEntryController),
);

waterRouter.patch(
  '/entry/:id',
  isValidId,
  validateBody(waterEntrySchema),
  ctrlWrapper(waterControllers.updateWaterEntryController),
);

waterRouter.delete(
  '/entry/:id',
  isValidId,
  ctrlWrapper(waterControllers.deleteWaterEntryController),
);

waterRouter.get(
  '/today',
  ctrlWrapper(waterControllers.getDailyWaterDataController),
);

waterRouter.get(
  '/month/:month',
  validateParams(monthFormatSchema),
  ctrlWrapper(waterControllers.getMonthlyWaterDataController),
);

waterRouter.patch(
  '/daily-norma',
  validateBody(dailyGoalSchema),
  ctrlWrapper(waterControllers.updateDailyWaterController),
);

export default waterRouter;
