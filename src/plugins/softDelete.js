const softDeletePlugin = function (schema, options) {
  // Añadir el campo 'deletedAt' al esquema
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  // Añadir un método estático para encontrar elementos eliminados
  schema.statics.findTrash = async function () {
    return this.find({ deletedAt: { $ne: null } });
  };

  // Añadir un método para realizar eliminación suave
  schema.methods.deleteOne = async function () {
    this.deletedAt = new Date();

    await this.save();
  };

  // Añadir un método para realizar eliminación suave
  schema.methods.destroyOne = async function () {
    this.deletedAt = new Date();

    await this.save();
  };

  // Añadir un método para restaurar elementos eliminados
  schema.methods.restoreOne = async function () {
    this.deletedAt = null;
    await this.save();
  };

  // Añadir un método estático para restaurar todos los elementos eliminados
  schema.statics.restore = async function () {
    return this.updateMany({ deletedAt: { $ne: null } }, { deletedAt: null });
  };

  // Añadir un método estático para restaurar todos los elementos eliminados
  schema.statics.deleteOne = async function (conditions = {}) {
    conditions.deletedAt = null;

    return this.findOneAndUpdate(
      conditions,
      { deletedAt: new Date() },
      { new: true }
    );
  };

  // // Sobrescribir el método estático 'find' para devolver solo los no eliminados por defecto
  // const originalFind = schema.methods.find;

  // schema.statics.find = function (conditions = {}) {
  //   if (!conditions.hasOwnProperty("deletedAt")) {
  //     conditions.deletedAt = null;
  //   }
  //   return originalFind.call(this, conditions);
  // };
};

module.exports = softDeletePlugin;
