import { Router } from 'express';

import * as waterControllers from '../controllers/waterControllers.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';

import { waterEntrySchema, dailyGoalSchema } from '../validation/water.js';

const waterRouter = Router();

// Додавання запису по спожитій воді
waterRouter.post(
  '/water-entry',
  authenticate,
  validateBody(waterEntrySchema),
  ctrlWrapper(waterControllers.addWaterEntryController),
);

// Редагування запису по спожитій воді
waterRouter.patch(
  '/water-entry/:id',
  authenticate,
  validateBody(waterEntrySchema),
  ctrlWrapper(waterControllers.updateWaterEntryController),
);

// Видалення запису по спожитій воді
waterRouter.delete(
  '/water-entry/:id',
  authenticate,
  ctrlWrapper(waterControllers.deleteWaterEntryController),
);

waterRouter.get(
  '/today',
  authenticate,
  ctrlWrapper(waterControllers.getDailyWaterDataController),
);

waterRouter.get(
  '/month/:month',
  authenticate,
  ctrlWrapper(waterControllers.getMonthlyWaterDataController),
);

// Оновлення денної норми споживання води
waterRouter.patch(
  '/daily-norma',
  authenticate,
  validateBody(dailyGoalSchema),
  ctrlWrapper(waterControllers.updateDailyWaterController),
);

export default waterRouter;
