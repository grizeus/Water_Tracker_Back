import Joi from 'joi';

/* закоментований код - це пропозиція щодо змін в схемі, які будуть валідувати формат час який заходить в базу */
// import { waterRegexp } from "../constants/water.js";

export const waterEntrySchema = Joi.object({
  amount: Joi.number().integer().min(50).max(5000).messages({
    'number.base': 'Amount must be a number.',
    'number.min': 'Amount must be at least 50.',
    'number.max': 'Amount must be no more than 5000.',
  }),

  time: Joi.string().messages({
    'string.base': 'Time must be a string.',
  }),

  // time: Joi.string().regex(waterRegexp)
});

export const dailyGoalSchema = Joi.object({
  dailyGoal: Joi.number().integer().min(50).max(15000).messages({
    'number.base': 'Daily goal must be a number.',
    'number.min': 'Daily goal must be at least 50.',
    'number.max': 'Daily goal must be no more than 15000.',
  }),
});
