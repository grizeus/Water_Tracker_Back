export const handleSaveError = (error, doc, next) => {
  const { name, code } = error;
  error.status = name === 'MongoServerError' && code === 11000 ? 409 : 400;
  if (error.status === 409) {
    error.message = 'Email in use';
  }
  next();
};

export const setUpdateSettings = function (next) {
  if (!this.optins) {
    this.optins = {};
  }
  this.optins.new = true;
  this.optins.runValidators = true;
  next();
};
