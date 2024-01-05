const jwt = require("jsonwebtoken");
const Account = require("../models/Account");
const bcrypt = require("bcrypt");

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar la cuenta por correo electrónico
      const account = await Account.findOne({ email }).populate("user");

      if (!account) {
        return res.status(401).json({
          msg: "Credenciales incorrectas",
        });
      }

      // Verificar la contraseña
      const passwordMatch = bcrypt.compare(password, account.password);

      if (!passwordMatch) {
        return res.status(401).json({
          msg: "Credenciales incorrectas",
        });
      }

      // Generar token
      const token = jwt.sign(
        { accountId: account._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "5h", // Puedes ajustar la duración del token según tus necesidades
        }
      );

      res.status(200).json({
        msg: "Inicio de sesión exitoso",
        data: { token, user: account.user },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        msg: "Algo salió mal",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;
