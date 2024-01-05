class ApiCustomError extends Error {
  constructor(message, details = null, status = 500) {
    super(message);
    this.customError = true;
    // this.errorMessage = message;
    this.details = details;
    this.status = status;
  }
}

module.exports = ApiCustomError;
