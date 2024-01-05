const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete");
const manageExternalId = require("../plugins/manageExternalId");

const PurchaseSchema = new mongoose.Schema(
  {
    clientFullName: {
      type: String,
      required: true,
    },
    clientDni: {
      type: String,
      default: null,
    },
    clientAddress: {
      type: String,
      default: null,
    },
    clientPhone: {
      type: String,
      default: null,
    },
    // user: {
    //   ref: "User",
    //   required: true,
    // },
    subtotal: {
      type: Number,
      min: 0,
    },
    IVA: {
      type: Number,
      min: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    paymentType: {
      type: String,
      enum: ["Efectivo", "Tarjeta"],
    },
    products: [
      {
        name: {
          type: String,
          required: true,
        },
        unitPrice: {
          type: Number,
          min: 0,
        },
        totalPrice: {
          type: Number,
          min: 0,
        },
        qyt: {
          type: Number,
          min: 1,
          default: 1,
        },
        document: {
          type: mongoose.Types.ObjectId,
          ref: "Document",
        },
        seller: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

PurchaseSchema.plugin(softDeletePlugin);
PurchaseSchema.plugin(manageExternalId);

const Purchase = mongoose.model("Purchase", PurchaseSchema);

module.exports = Purchase;
