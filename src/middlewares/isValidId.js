import { isValidObjectId } from 'mongoose';

import createHttpError from 'http-errors';

export const isValidId = (req, res, next) => {
  const { id } = req.params;
  console.log('Received ID:', id); // Додаємо логування

  if (!isValidObjectId(id)) {
    console.log('Invalid ID format:', id); // Лог для перевірки
    return next(createHttpError(400, 'Invalid ID format'));
  }

  next();
};
