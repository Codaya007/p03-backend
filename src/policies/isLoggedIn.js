const validateToken = require("../helpers/validateToken");
const Account = require("../models/Account");

module.exports = async (req, res, next) => {
  try {
    const bearerToken = req.header("Authorization");

    if (!bearerToken) {
      return res.status(401).json({
        errorMessage: "Sin autenticación presente",
        details: "'Authorization' header is not present",
      });
    }

    const decodedToken = await validateToken(bearerToken.split(" ")[1]);

    // Aquí debes realizar la lógica para obtener la cuenta del usuario basada en el ID del token decodificado
    // y luego popular el usuario dentro de la cuenta. Asumiré que hay un modelo User en tu código.

    const account = await Account.findOne({
      _id: decodedToken.accountId,
    }).populate("user");

    if (!account) {
      return res.status(401).json({
        errorMessage: "Token no válido",
        details: "No se encontró la cuenta asociada al token",
      });
    }

    if (account.deletedAt) {
      return res.status(403).json({
        errorMessage:
          "Su usuario fue dado de baja, contáctese con el administrador.",
      });
    }

    // console.log({ account });

    if (account.status !== "Activa") {
      return res.status(403).json({
        msg: `Su usuario se encuentra ${
          account.status || "eliminado"
        }, contáctese con el administrador`,
      });
    }

    // Agrega el objeto de la cuenta al objeto req para su posterior uso
    req.me = account;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: error.message,
      details: error.message,
    });
  }
};
