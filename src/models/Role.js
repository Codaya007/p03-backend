const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete");
const manageExternalId = require("../plugins/manageExternalId");

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

RoleSchema.plugin(softDeletePlugin);
RoleSchema.plugin(manageExternalId);

const Role = mongoose.model("Role", RoleSchema);

module.exports = Role;
