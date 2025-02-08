import Joi from 'joi';

import { waterRegexp } from '../constants/water.js';

export const waterEntrySchema = Joi.object({
  amount: Joi.number().integer().min(50).max(5000).messages({
    'number.base': 'Amount must be a number.',
    'number.min': 'Amount must be at least 50.',
    'number.max': 'Amount must be no more than 5000.',
  }),
  time: Joi.string().regex(waterRegexp).messages({
    'string.base': 'Time must be a string.',
    'string.YYYY-MM-DD-HH:MM.base':
      'Time format is invalid.Correct date format: YYYY-MM-DD-HH:MM',
  }),
});

export const dailyGoalSchema = Joi.object({
  dailyGoal: Joi.number().integer().min(50).max(15000).messages({
    'number.base': 'Daily goal must be a number.',
    'number.min': 'Daily goal must be at least 50.',
    'number.max': 'Daily goal must be no more than 15000.',
  }),
});

export const monthFormatSchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .required()
    .messages({
      'string.pattern.base': 'The date must be in the format YYYY-MM (e.g., 2025-02)',
      'any.required': 'The month parameter is required',
    }),
});
