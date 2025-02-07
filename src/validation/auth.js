import Joi from 'joi';

import { regularExpressionEmail } from '../constants/auth.js';

export const authRegisterSchema = Joi.object({
  name: Joi.string().min(3).max(30).messages({
    'string.min': 'Invalid name number of characters. Minimum is 3.',
    'string.max': 'Invalid name number of characters. Maximum is 20.',
  }),
  email: Joi.string().pattern(regularExpressionEmail).required().messages({
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(8).max(64).required().messages({
    'string.min': 'Invalid password number of characters. Minimum is 8.',
    'string.max': 'Invalid password number of characters. Max is 64.',
    'any.required': 'Password is required.',
  }),
});

export const authLoginSchema = Joi.object({
  email: Joi.string().pattern(regularExpressionEmail).required().messages({
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(8).max(64).required().messages({
    'string.min': 'Invalid password number of characters. Minimum is 8.',
    'string.max': 'Invalid password number of characters. Max is 64.',
    'any.required': 'Password is required.',
  }),
});
