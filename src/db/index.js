const process = require("../config");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Configuración global para excluir el campo _id al convertir a JSON
    mongoose.set("toJSON", {
      transform: (doc, ret) => {
        ret.id = ret.external_id;
        // Elimino campos delicados por seguridad
        delete ret._id; // Eliminar el campo _id
        delete ret.__v; // Eliminar el campo __v si es necesario
        delete ret.external_id; // Eliminar el campo __v si es necesario
      },
    });

    const connection = await mongoose.connect(process.db.url);

    console.info(`MongoDB Connected: ${connection.connection.host}`);
  } catch (err) {
    console.error("No ha sido posible realizar una conexión con la BBDD");
    console.error(` Error: ${err.message} `);

    throw err;
  }
};

module.exports = connectDB;
