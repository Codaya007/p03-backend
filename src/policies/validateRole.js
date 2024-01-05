const User = require("../models/User");

module.exports = (role) => async (req, res, next) => {
  try {
    const account = req.me;

    if (!account) {
      throw new Error("No hay usuario");
    }

    // Busco el user y populo el role
    const user = await User.findOne({ _id: account?.user?._id }).populate(
      "role"
    );

    if (user.role.name === role) {
      return next();
    }

    res.status(403).json({
      msg: "No tiene permiso para acceder a este servicio",
    });
  } catch (error) {
    res.status(401).json({
      message: "Algo salió mal",
      details: error.message,
    });
  }
};
