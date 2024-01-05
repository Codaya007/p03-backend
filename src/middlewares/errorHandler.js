const errorHandler = async (error, req, res, next) => {
  console.log({ error });

  const status = error.status || 500;
  const errorMessage = error.errorMessage || "Algo salió mal";
  const details = error.details || error.message || null;

  res.status(status).json({ errorMessage, details });
};

module.exports = errorHandler;
