const uuidv4 = require("uuid").v4;

module.exports = function manageExternalIdPlugin(schema, options) {
  schema.add({
    external_id: {
      type: String,
      unique: true,
    },
  });

  // Al crear un documento, se añade por default el external_id
  schema.pre("create", function (next) {
    if (!this.external_id) {
      this.external_id = uuidv4();
    }

    next();
  });

  schema.pre("save", function (next) {
    if (this.isNew && !this.external_id) {
      this.external_id = uuidv4();
    }

    next();
  });

  // Añado la función refreshExternal para poderla llamar cuando la necesite y actualice el external
  schema.methods.refreshExternal = async function () {
    this.external_id = uuidv4();

    await this.save();
  };
};
