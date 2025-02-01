export const handleSaveError = (error, doc, next) => {
  const { name, code } = error;
  error.status = name === 'MongoServerError' && code === 11000 ? 409 : 400;
  if (error.status === 409) {
    error.message = 'Email in use';
  }
  next();
};

export const setUpdateSettings = function (next) {
  if (!this.options) {
    this.options = {};
  }
  this.options.new = true;
  this.options.runValidators = true;
  next();
};
