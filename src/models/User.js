const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete");
const manageExternalId = require("../plugins/manageExternalId");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    dni: {
      type: String,
    },
    phone: {
      type: String,
    },
    role: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Role",
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(softDeletePlugin);
UserSchema.plugin(manageExternalId);

const User = mongoose.model("User", UserSchema);

module.exports = User;
