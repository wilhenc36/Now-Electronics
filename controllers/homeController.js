const mongoose = require("mongoose");
const Producto = mongoose.model("Producto");

exports.mostrarProductos = async (req, res, next) => {
  // Obtener todos los productos disponibles
  const productos = await Producto.find().lean();

  //roles
  var usuario = false;
  var admin = false;
  var miron = false;
  var rol, nombre; 
  if(req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if(rol == "usuario") {
      usuario = true;
    }
  }
  if(req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if(rol == "admin") {
      admin = true;
    }
  }
  if(req.isAuthenticated() != true) {
    miron = true;
  }

  res.render("buscar", { productos, usuario, admin, miron, nombre });
};