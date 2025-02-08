import createHttpError from 'http-errors';

export const validateParams = (schema) => {
  const func = async (req, res, next) => {
    try {
      await schema.validateAsync( req.params, {
        abortEarly: false,
      });
      next();
    } catch (error) {
      next(createHttpError(400, error.message));
    }
  };
  return func;
};