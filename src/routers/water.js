import { Router } from 'express';
import * as waterControllers from '../controllers/waterControllers.js';
import { validateBody } from '../middlewares/validateBody.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
// import { authenticate } from '../middlewares/authenticate.js';

const waterRouter = Router();

// Додавання запису по спожитій воді
waterRouter.post(
  '/water-entry',
  //   authenticate, // Мідлвар для автентифікації
  validateBody(), // Валідація для amount та time
  ctrlWrapper(waterControllers.addWaterEntryController),
);

// Редагування запису по спожитій воді
waterRouter.patch(
  '/water-entry/:id',
  //   authenticate, // Мідлвар для автентифікації
  validateBody(), // Валідація для amount та time
  ctrlWrapper(waterControllers.updateWaterEntryController),
);

// Видалення запису по спожитій воді
waterRouter.delete(
  '/water-entry/:id',
  //   authenticate, // Мідлвар для автентифікації
  ctrlWrapper(waterControllers.deleteWaterEntryController),
);

waterRouter.get(
  '/today',
  //   authenticate, // Мідлвар для автентифікації
  ctrlWrapper(waterControllers.getDailyWaterDataController),
);

waterRouter.get(
  '/month/:month',
  //   authenticate, // Мідлвар для автентифікації
  ctrlWrapper(waterControllers.getMonthlyWaterDataController),
);

// Оновлення денної норми споживання води
waterRouter.patch(
  '/user/daily-goal',
  //   authenticate, // Мідлвар для автентифікації
  validateBody(), // Валідація для dailyGoal
  ctrlWrapper(waterControllers.updateDailyWaterController),
);

export default waterRouter;
