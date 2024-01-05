const Role = require("../models/Role");

// No se puede: Eliminar, editar
class RoleController {
  async list(req, res) {
    const { page = 1, limit = 10, ...where } = req.query;

    where.deletedAt = null;

    const totalCount = await Role.countDocuments(where);
    const data = await Role.find(where)
      .skip((parseInt(page) - 1) * limit)
      .limit(limit)
      .exec();

    res.status(200);
    res.json({
      msg: "OK",
      totalCount,
      data,
    });
  }

  async getById(req, res) {
    const { external_id } = req.params;

    const data = await Role.findOne({
      external_id,
    });

    if (!data) {
      return res.status(404).json({
        msg: "El registro especificado no existe",
      });
    }

    await data.refreshExternal();

    res.status(200).json({
      msg: "OK",
      data,
    });
  }

  async create(req, res) {
    const { name } = req.body;

    try {
      if (!name) {
        return res.status(400).json({
          msg: "El campo 'name' es requerido",
        });
      }

      const nameAlreadyExists = await Role.countDocuments({ name });

      if (nameAlreadyExists) {
        return res.status(400).json({
          msg: `Ya existe un rol '${name}'`,
        });
      }

      const data = await Role.create({
        name,
      });

      res.status(201).json({
        msg: "OK",
        data,
      });
    } catch (error) {
      res.json({
        msg: "Algo salió mal",
        error: error.message,
      });
    }
  }
}

module.exports = RoleController;
