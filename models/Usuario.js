// Importar los módulos requeridos
const mongoose = require("mongoose");

// Definición del schema
const usuarioSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    ciudad: String,
    pais: String,
    token: String,
    expira: Date,
    gravatar: String,
    activo: Boolean,
  });

  module.exports = mongoose.model("Usuarios", usuarioSchema);