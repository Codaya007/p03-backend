const { ISBN_REGEX } = require("../constants");
const Document = require("../models/Document");
const User = require("../models/User");

class DocumentController {
  async list(req, res) {
    const { page = 1, limit = 20, owner, ...where } = req.query;

    where.deletedAt = null;

    try {
      if (owner) {
        const userDB = await User.findOne({ external_id: owner });

        if (userDB) {
          where.owner = userDB._id;
        }
      }

      // console.log({ where });

      const totalCount = await Document.countDocuments(where);
      let data = await Document.find(where)
        .skip((parseInt(page) - 1) * limit)
        .limit(limit)
        .exec();

      data = await Promise.all(
        data.map(async (document) => {
          document = document.toJSON();
          // Calculo la cantidad restante de libros
          document.qyt = document.totalQyt - document.qytSelled;

          return document;
        })
      );

      res.status(200).json({
        msg: "OK",
        totalCount,
        data,
      });
    } catch (error) {
      res.status(500).json({
        msg: "Algo salió mal",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    const { external_id } = req.params;

    try {
      const data = await Document.findOne({ external_id });

      if (!data) {
        return res.status(404).json({
          msg: "El registro especificado no existe",
        });
      }

      // await data.refreshExternal();

      res.status(200).json({
        msg: "OK",
        data,
      });
    } catch (error) {
      res.status(500).json({
        msg: "Algo salió mal",
        error: error.message,
      });
    }
  }

  async create(req, res) {
    const {
      title,
      author,
      price,
      type,
      ISBN,
      totalQyt,
      // qytSelled,
      images,
      audio,
    } = req.body;
    let { owner } = req.body;

    if (!["Libro fisico", "Audiolibro"].includes(type)) {
      return res.status(400).json({
        msg: "Los tipos de documento permitidos son: Libro fisico, Audiolibro",
      });
    }

    if (type === "Audiolibro" && !audio) {
      return res.status(400).json({
        msg: "Los documentos de tipo 'Audio' requieren un audio",
      });
    }

    if (!ISBN_REGEX.test(ISBN)) {
      return res.status(400).json({
        msg: "ISBN no válido",
      });
    }

    try {
      if (!owner || !title || !author || !price) {
        return res.status(400).json({
          msg: "Los campos 'owner', 'title', 'author' y 'price' son requeridos",
        });
      }

      if (price <= 0) {
        return res.status(400).json({
          msg: "El campo price debe ser mayor a 0",
        });
      }

      if (totalQyt <= 0) {
        return res.status(400).json({
          msg: "El campo totalQyt debe ser mayor a 0",
        });
      }

      const ownerDB = await User.findOne({ external_id: owner });

      if (!ownerDB) {
        return res.status(404).json({
          msg: "Propietario no encontrado",
        });
      }

      owner = ownerDB._id;

      const data = await Document.create({
        owner,
        title,
        author,
        price,
        type,
        ISBN,
        totalQyt,
        qytSelled: 0,
        images,
        audio,
      });

      res.status(201).json({
        msg: "OK",
        data,
      });
    } catch (error) {
      res.status(500).json({
        msg: "Algo salió mal",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    const { external_id } = req.params;
    const { owner, ...updateFields } = req.body;

    try {
      const { price, totalQyt } = updateFields;

      const ownerDB = await User.findOne({ external_id: owner });

      if (!ownerDB) {
        return res.status(404).json({
          msg: "Propietario no encontrado",
        });
      }

      updateFields.owner = ownerDB._id;

      if (price && price <= 0) {
        return res.status(400).json({
          msg: "El campo price debe ser mayor a 0",
        });
      }

      if (totalQyt && totalQyt <= 0) {
        return res.status(400).json({
          msg: "El campo totalQyt debe ser mayor a 0",
        });
      }

      // Buscar y actualizar el documento
      const data = await Document.findOneAndUpdate(
        { external_id },
        updateFields,
        {
          new: true, // Devolver el documento modificado
        }
      );

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
    } catch (error) {
      res.status(500).json({
        msg: "Algo salió mal",
        error: error.message,
      });
    }
  }

  async remove(req, res) {
    const { external_id } = req.params;

    try {
      // Eliminar el documento (soft delete)
      const data = await Document.deleteOne({ external_id });

      console.log({ data });

      if (!data) {
        return res.status(404).json({
          msg: "El registro especificado no existe",
        });
      }

      await data.refreshExternal();

      res.status(200).json({
        msg: "OK",
      });
    } catch (error) {
      console.log({ error });

      res.status(500).json({
        msg: "Algo salió mal",
        error: error.message,
      });
    }
  }
}

module.exports = DocumentController;
