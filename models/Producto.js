// Importar los módulos requeridos
const mongoose = require("mongoose");
const shortid = require("shortid");
const slug = require("slug");

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
  imagen: String,
  precio: {
    type: Number,
    required: true,
  },
  fechaCreacion: Date,
  url: {
    type: String,
    lowercase: true,
  },
  etiquetas: String,
  vendedor: {
    type: mongoose.Schema.ObjectId,
    ref: "Usuarios",
    required: true,
  },
  comprador: {
    type: mongoose.Schema.ObjectId,
    ref: "Usuarios",
  },
  fechaVenta: Date,
  estado: String,
  publicar: Boolean,
});
// Hooks para generar la URL del producto
productoSchema.pre("save", function (next) {
  // Crear la URL
  const url = slug(this.nombre);
  this.url = `${url}-${shortid.generate()}`;

  // Almacenar la fecha de creación del producto
  this.fechaCreacion = Date.now();

  next();
});

// Generar un índice para mejorar la búsqueda por el nombre del producto
productoSchema.index({ nombre: "text" });

module.exports = mongoose.model("Producto", productoSchema);