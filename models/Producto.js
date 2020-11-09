// Importar los módulos requeridos
const mongoose = require("mongoose");
const shortid = require("shortid");

// Definición del schema
const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
  },
  precio: {
    type: Number,
    required: true,
  },
  fechaCreacion: Date,
  url: {
    type: String,
    lowercase: true,
  },
  etiquetas: [String],
  vendedor: {
    type: mongoose.Schema.ObjectId,
    ref: "Usuario",
    required: true,
  },
  comprador: {
    type: mongoose.Schema.ObjectId,
    ref: "Usuario",
  },
  fechaVenta: Date,
});
// Hooks para generar la URL del producto
productoSchema.pre("save", function (next) {
  // Crear la URL
  const url = slug(this.nombre);
  this.url = `${url}-${shortid.generate()}`;

  next();
});

// Generar un índice para mejorar la búsqueda por el nombre del producto
productoSchema.index({ nombre: "text" });

module.exports = mongoose.model("Producto", productoSchema);