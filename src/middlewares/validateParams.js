import createHttpError from 'http-errors';

export const validateParams = (schema) => {
  const func = async (req, res, next) => {
    try {
      await schema.validateAsync( req.params, {
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
