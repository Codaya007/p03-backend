const ApiCustomError = require("../errors/ApiError");

const notFound = (req, res, next) => {
  const error = new ApiCustomError(
    `La página solicitada ${req.url} no se encontró`,
    `La página solicitada ${req.url} no se encontró`,
    404
  );

  next(error);
};

module.exports = notFound;
