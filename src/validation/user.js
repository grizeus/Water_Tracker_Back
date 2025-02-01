import Joi from 'joi';
import { genderList } from '../constants/user.js';

export const userInfo = Joi.object({
  email: Joi.string().email().messages({
    'string.base': 'Email must be a string.',
    'string.email': 'Email must be a valid email address.',
  }),

  password: Joi.string().min(8).max(64).messages({
    'string.base': 'Password must be a string.',
    'string.min': 'Password must be at least 8 characters long.',
    'string.max': 'Password must be at most 64 characters long.',
  }),

  oldPassword: Joi.string().min(8).max(64).messages({
    'string.base': 'Old password must be a string.',
    'string.min': 'Old password must be at least 8 characters long.',
    'string.max': 'Old password must be at most 64 characters long.',
  }),

  gender: Joi.string()
    .valid(...genderList)
    .messages({
      'string.base': 'Gender must be a string.',
      'any.only': 'Gender must be one of the following values: male, female.',
    }),

  name: Joi.string().max(32).messages({
    'string.base': 'Name must be a string.',
    'string.max': 'Name must be at most 32 characters long.',
  }),
});
