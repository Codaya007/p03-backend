const { Types } = require("mongoose");

/**
 * Valida si un string es un objectId válido
 * @param {String} string Id
 * @return {Boolean} Es valido
 */
const isValidObjectId = Types.ObjectId.isValid;

/**
 * Genera un string urlFriendly, que puede servir como token
 * @return {String} Devuelve token
 */
const generateUrlFriendlyToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Para recuperar la contraseña dale click al siguiente enlace {baseurl_front}/recoverypassword/{token}

module.exports = {
  isValidObjectId,
  generateUrlFriendlyToken,
};
