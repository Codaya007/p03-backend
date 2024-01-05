const Account = require("../models/Account");
const User = require("../models/User");
const Role = require("../models/Role");
const { startSession, withTransaction } = require("mongoose");
const jwt = require("jsonwebtoken");
const { PHONE_REGEX } = require("../constants");

class UserController {
  async list(req, res) {
    const { page = 1, limit = 20, ...where } = req.query;

    where.deletedAt = null;

    const totalCount = await User.countDocuments(where);
    const data = await User.find(where)
      .populate("role")
      .skip((parseInt(page) - 1) * limit)
      .limit(limit)
      .exec();

    // data.map((user) => {
    //   user.role = user.role?.name || null;
    // });

    res.status(200);
    res.json({
      msg: "OK",
      totalCount,
      data,
    });
  }

  async getById(req, res) {
    const { external_id } = req.params;

    const data = await User.findOne({
      external_id,
    });

    if (!data) {
      return res.status(404).json({
        msg: "El usuario especificado no existe",
      });
    }

    // await data.refreshExternal();

    res.status(200).json({
      msg: "OK",
      data,
    });
  }

  async create(req, res) {
    const { name, lastname, address, phone, dni, email, password } = req.body;
    let { role } = req.body;

    if (
      !name ||
      !lastname ||
      !address ||
      !dni ||
      !phone ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        msg: "No se han enviado todos los datos",
      });
    }

    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({
        msg: "Número celular no válido",
      });
    }

    const session = await startSession();

    try {
      session.startTransaction();
      // await withTransaction(session, async () => {
      // Buscar el rol en la base de datos
      const roleDB = await Role.findOne({ external_id: role });

      if (!roleDB) {
        return res.status(404).json({
          msg: "El rol especificado no existe",
        });
      }

      role = roleDB._id;

      // Crear usuario
      const user = new User({
        name,
        lastname,
        address,
        phone,
        dni,
        role,
        email,
      });

      await user.save({ session });

      // Crear cuenta y encriptar la contraseña
      // const hashedPassword = await bcrypt.hash(password, 10);
      const account = new Account({
        email,
        // password: hashedPassword,
        password,
        user: user._id,
      });

      await account.save({ session });

      // Generar token
      const token = jwt.sign(
        { accountId: account._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "5h", // Puedes ajustar la duración del token según tus necesidades
        }
      );

      // Commit de la transacción
      await session.commitTransaction();

      res.status(201).json({
        msg: "OK",
        data: { user, account, token },
      });
      // });
    } catch (error) {
      console.log({ error });

      await session.abortTransaction();

      res.status(500).json({
        tag: "Algo salió mal",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  }

  async update(req, res) {
    const { name, lastname, address, phone, dni, email, password } = req.body;
    let { role } = req.body;
    const { external_id } = req.params;

    const session = await startSession();

    try {
      session.startTransaction();
      // await withTransaction(session, async () => {
      // Buscar el rol en la base de datos si se proporciona
      if (role) {
        const roleDB = await Role.findOne({ external_id: role });

        if (!roleDB) {
          return res.status(404).json({
            msg: "El rol especificado no existe",
          });
        }

        role = roleDB._id;
      }

      // Buscar y actualizar usuario
      const user = await User.findOne({ external_id });

      if (!user) {
        return res.status(404).json({
          msg: "Usuario no encontrado",
        });
      }

      // Actualizar los campos del usuario si se proporcionan
      if (name) user.name = name;
      if (lastname) user.lastname = lastname;
      if (address) user.address = address;
      if (phone) user.phone = phone;
      if (dni) user.dni = dni;
      if (role) user.role = role;
      if (email) user.email = email;

      await user.save({ session });
      await user.refreshExternal();

      // Buscar y actualizar cuenta si se proporciona una nueva contraseña
      const account = await Account.findOne({ user: user._id });

      if (password) {
        if (!account) {
          return res.status(404).json({
            msg: "Cuenta no encontrada",
          });
        }

        account.password = password;
      }
      if (email) account.email = email;

      await account.save({ session });

      // Commit de la transacción
      await session.commitTransaction();

      res.status(200).json({ msg: "OK" });
      // });
    } catch (error) {
      await session.abortTransaction();

      res.status(500).json({
        msg: "Algo salió mal",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  }
}

module.exports = UserController;
