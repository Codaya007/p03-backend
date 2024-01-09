// Importa las bibliotecas necesarias
const jwt = require("jsonwebtoken");

// Función para validar el token
const validateToken = async (token) => {
  // console.log({ token });
  return new Promise((resolve, reject) => {
    // Verifica el token usando la clave secreta
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }

      // Devuelve el objeto decodificado del token
      resolve(decoded);
    });
  });
};

module.exports = validateToken;
