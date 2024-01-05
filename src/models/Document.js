const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete");
const manageExternalId = require("../plugins/manageExternalId");

const DocumentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    type: {
      type: String,
      enum: ["Libro fisico", "Audiolibro"],
    },
    ISBN: {
      type: String,
      allowNull: true,
    },
    totalQyt: {
      type: Number,
      isInteger: true,
      min: 0,
      default: 0,
    },
    qytSelled: {
      type: Number,
      isInteger: true,
      min: 0,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    audio: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

DocumentSchema.plugin(softDeletePlugin);
DocumentSchema.plugin(manageExternalId);

const Document = mongoose.model("Document", DocumentSchema);

module.exports = Document;
