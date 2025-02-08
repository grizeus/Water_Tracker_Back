export const validateRequest = (schema, source = 'params') => (req, res, next) => {
    const { error } = schema.validate(req[source]);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
  