import createHttpError from 'http-errors';

export const validateBody = (schema) => {
  const func = async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, {
        abortEarly: false,
      });
      next();
    } catch (error) {
      const errorMessage = error.details?.[0]?.message || error.message;
      next(createHttpError(400, errorMessage));
    }
  };
  return func;
};
