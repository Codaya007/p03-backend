const Purchase = require("../models/Purchase");
const User = require("../models/User");
const Document = require("../models/Document");
const { DNI_REGEX, PHONE_REGEX, IVA_PERCENTAJE } = require("../constants");
const ApiCustomError = require("../errors/ApiError");
const moment = require("moment-timezone");
const { Types } = require("mongoose");

class PurchaseController {
  async create(req, res) {
    try {
      const {
        clientFullName,
        clientDni,
        clientAddress,
        clientPhone,
        paymentType = "Efectivo",
        products = [],
      } = req.body;

      let subtotal = 0;

      if (!clientFullName || !clientDni || !clientAddress || !clientPhone) {
        return res.status(400).json({
          msg: "Campos incompletos",
        });
      }

      if (!DNI_REGEX.test(clientDni)) {
        return res.status(400).json({
          msg: "La cédula del cliente no es válida",
        });
      }

      if (!PHONE_REGEX.test(clientPhone)) {
        return res.status(400).json({
          msg: "La número de teléfono del cliente no es válido",
        });
      }

      // Obtener detalles de productos
      const productsDetails = await Promise.all(
        products.map(async (product) => {
          const { document: externalDocumentId, qyt = 1 } = product;

          // Verificar si el documento y el vendedor existen
          const document = await Document.findOne({
            external_id: externalDocumentId,
          });

          if (!document) {
            throw new ApiCustomError(
              "Algunos productos ya no están disponibles",
              `${externalDocumentId}`,
              404
            );
          }

          const seller = await User.findOne({ _id: document.owner });

          const totalPrice = document.price * qyt;
          subtotal += totalPrice;

          return {
            name: `${document.type} '${document.title}'`,
            unitPrice: document.price,
            totalPrice,
            qyt,
            document: document._id,
            seller: seller?._id || null,
          };
        })
      );
      const IVA = subtotal * IVA_PERCENTAJE;
      const totalAmount = subtotal + IVA;

      // Crear la compra
      const purchase = await Purchase.create({
        clientFullName,
        clientDni,
        clientAddress,
        clientPhone,
        subtotal,
        IVA,
        totalAmount,
        paymentType,
        products: productsDetails,
      });

      res.status(201).json({
        msg: "OK",
        data: purchase,
      });
    } catch (error) {
      console.error(error);

      if (error.customError) {
        return res.status(error.status || 500).json({
          msg: error.message,
          error: error.details,
        });
      }

      res.status(500).json({
        msg: "Algo salió mal",
        error: error.message,
      });
    }
  }

  async list(req, res) {
    const { page = 1, limit = 20, ...where } = req.query;

    where.deletedAt = null;

    try {
      const totalCount = await Purchase.countDocuments(where);
      const data = await Purchase.find(where)
        .populate("products.seller")
        .skip((parseInt(page) - 1) * limit)
        .limit(limit)
        .exec();

      res.status(200).json({
        msg: "OK",
        totalCount,
        data,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        msg: "Algo salió mal",
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    const { external_id } = req.params;

    try {
      const data = await Purchase.findOne({ external_id });

      if (!data) {
        return res.status(404).json({
          msg: "La venta especificada no existe",
        });
      }

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

  async listQuincena(req, res) {
    const { page = 1, limit = 20, ...where } = req.query;
    const seller = req.me?.user?._id;

    try {
      const startDate = moment()
        .tz("America/Guayaquil")
        .startOf("day")
        .subtract(15, "days")
        .toDate();
      const endDate = moment().tz("America/Guayaquil").endOf("day").toDate();

      const pipeline = [
        {
          $match: {
            "products.seller": seller,
            createdAt: { $gte: startDate, $lte: endDate },
            ...where,
          },
        },
        {
          $unwind: "$products",
        },
        {
          $match: {
            "products.seller": seller,
          },
        },
        {
          $group: {
            _id: {
              document: "$products.document",
              seller: "$products.seller",
            },
            totalAmountSold: { $sum: "$products.totalPrice" },
            totalCount: { $sum: "$products.qyt" },
          },
        },
        {
          $lookup: {
            from: "documents",
            localField: "_id.document",
            foreignField: "_id",
            as: "documentDetails",
          },
        },
        {
          $project: {
            _id: 0,
            document: { $arrayElemAt: ["$documentDetails", 0] },
            totalAmountSold: 1,
            totalCount: 1,
          },
        },
        {
          $skip: (parseInt(page) - 1) * limit,
        },
        {
          $limit: limit,
        },
      ];

      const result = await Purchase.aggregate(pipeline);

      const totalValueSold = result.reduce(
        (total, sale) => total + sale.totalAmountSold,
        0
      );

      res.status(200).json({
        msg: "OK",
        totalCount: result.length,
        totalValueSold,
        data: result,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        msg: "Algo salió mal",
        error: error.message,
      });
    }
  }

  async listBySeller(req, res) {
    const { page = 1, limit = 20, ...where } = req.query;
    const { external_id } = req.params;

    try {
      const sellerDB = await User.findOne({ external_id });
      const seller = sellerDB._id || null;

      const startDate = moment()
        .tz("America/Guayaquil")
        .startOf("day")
        .subtract(15, "days")
        .toDate();
      const endDate = moment().tz("America/Guayaquil").endOf("day").toDate();

      const purchases = await Purchase.find({
        "products.seller": seller,
        createdAt: { $gte: startDate, $lte: endDate },
        ...where,
      })
        .skip((parseInt(page) - 1) * limit)
        .limit(limit);
      // .populate("products.document");

      res.status(200).json({
        msg: "OK",
        totalCount: purchases.length,
        data: purchases,
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

module.exports = PurchaseController;
