// Importar los módulos requeridos
const mongoose = require("mongoose");
const Producto = mongoose.model("Producto");
//const Carrito = mongoose.model("Carrito");
const { validationResult } = require("express-validator");
const multer = require("multer");
const shortid = require("shortid");

const year = new Date().getFullYear();

// Mostrar el formulario de creación de producto
exports.formularioCrearProducto = (req, res, next) => {
  //roles
  var usuario = false;
  var admin = false;
  var miron = false;
  var rol, nombre;
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "usuario") {
      usuario = true;
    }
  }
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "admin") {
      admin = true;
    }
  }
  if (req.isAuthenticated() != true) {
    miron = true;
  }

  res.render("crearProducto", { usuario, admin, miron, nombre, year });
};

// Crear un producto
exports.crearProducto = async (req, res, next) => {
  // Verificar que no existen errores de validación
  const errores = validationResult(req);
  const messages = [];

  // Si hay errores
  if (!errores.isEmpty()) {
    errores.array().map((error) => {
      messages.push({ message: error.msg, alertType: "danger" });
    });

    // Enviar los errores a través de flash messages
    req.flash("messages", messages);

    res.redirect("/admin/productos");
  } else {
    // Almacenar los valores del producto
    try {
      const { nombre, descripcion, precio, estado, etiquetas } = req.body;
      const imagen = [];

      for (let x = 0; x < req.files.length; x++) {
        if (req.files.length > 0) {
          imagen[x] = req.files[x].filename;
        }
        //console.log(imagen[x]);
      }

      await Producto.create({
        nombre,
        descripcion,
        precio,
        imagenes: imagen,
        vendedor: req.user._id,
        etiquetas,
        estado,
      });
      //console.log(req.files.length);
      messages.push({
        message: "¡Producto agregado correctamente!",
        alertType: "success",
      });
      req.flash("messages", messages);

      res.redirect("/admin/productos");
    } catch (error) {
      console.log(error);
      messages.push({
        message: error,
        alertType: "danger",
      });
      req.flash("messages", messages);
      res.redirect("/admin/productos");
    }
  }
};

// Permite subir un archivo (imagen) al servidor
exports.subirImagen = (req, res, next) => {
  // Verificar que no existen errores de validación
  const errores = validationResult(req);
  //const errores = [];
  const messages = [];

  if (!errores.isEmpty) {
    errores.array().map((error) => {
      messages.push({ message: error.msg, alertType: "danger" });
    });

    req.flash("messages", messages);
    res.redirect("/admin/productos");
  } else {
    // Subir el archivo mediante Multer
    upload(req, res, function (error) {
      if (error) {
        // Errores de Multer
        if (error instanceof multer.MulterError) {
          if (error.code === "LIMIT_FILE_SIZE") {
            req.flash("messages", [
              {
                message:
                  "El tamaño del archivo es superior al límite. Máximo 300Kb",
                alertType: "danger",
              },
            ]);
          } else {
            req.flash("messages", [
              { message: error.message, alertType: "danger" },
            ]);
          }
        } else {
          // Errores creado por el usuario
          req.flash("messages", [
            { message: error.message, alertType: "danger" },
          ]);
        }
        // Redireccionar y mostrar el error
        res.redirect("/admin/productos");
        return;
      } else {
        // Archivo cargado correctamente
        return next();
      }
    });
  }
};

// Opciones de configuración para multer en productos
const configuracionMulter = {
  // Tamaño máximo del archivo en bytes
  limits: {
    fileSize: 1000000,
  },
  // Dónde se almacena el archivo
  storage: (fileStorage = multer.diskStorage({
    destination: (req, res, cb) => {
      cb(null, `${__dirname}../../public/uploads`);
    },
    filename: (req, file, cb) => {
      // Construir el nombre del archivo
      // iphone.png --> image/png --> ["image", "png"]
      // iphone.jpg --> image/jpeg
      const extension = file.mimetype.split("/")[1];
      cb(null, `${shortid.generate()}.${extension}`);
    },
  })),
  // Verificar el tipo de archivo mediante el mime type
  // https://developer.mozilla.org/es/docs/Web/HTTP/Basics_of_HTTP/MIME_types
  fileFilter(req, file, cb) {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      // Si el callback retorne true se acepta el tipo de archivo
      cb(null, true);
    } else {
      cb(
        new Error(
          "Formato de archivo no válido. Solamente se permniten JPEG/JPG o PNG"
        ),
        false
      );
    }
  },
};

// Muestra un producto que se obtiene a través de su URL
exports.verProducto = async (req, res, next) => {
  //roles
  var usuario = false;
  var admin = false;
  var miron = false;
  var rol, nombre;
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "usuario") {
      usuario = true;
    }
  }
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "admin") {
      admin = true;
    }
  }
  if (req.isAuthenticated() != true) {
    miron = true;
  }

  // Utilizar la opción populate para obtener información sobre un Object_ID
  const producto = await Producto.findOne({ url: req.params.url })
    .populate("vendedor")
    .lean();

  // Buscar productos en el carrito de compras si existen
  //const carrito = await Carrito.findOne({ usuario: req.user._id });

  if (producto.estado == "nuevo") {
    producto.estado = true;
  } else {
    producto.estado = false;
  }

  if (!producto) res.redirect("/");
  else {
    res.render("mostrarProducto", {
      usuario,
      admin,
      miron,
      nombre,
      producto,
      //productosCarrito: carrito ? carrito.producto.length : 0,
    });
  }
};

// Función que sube el archivo
const upload = multer(configuracionMulter).array("imagen");
/*
// Agrega productos al carrito de compras
exports.agregarProductoCarrito = async (req, res, next) => {
  try {
    // Obtener el producto a través del URL
    const { url } = req.params;

    const producto = await Producto.findOne({ url });

    // Buscar si el usuario ya tiene un carrito existente
    const carrito = await Carrito.findOne({ usuario: req.user._id });

    console.log(carrito);

    // Si el carrito no existe
    if (!carrito) {
      // Crear el arreglo de productos
      const productos = [];
      productos.push(producto);

      const nuevoCarrito = new Carrito({
        producto: productos,
        usuario: req.user._id,
        fecha: Date.now(),
        total: producto.precio,
      });

      // Almacenar el carrito
      await nuevoCarrito.save();

      req.flash("messages", [
        {
          message: "Producto agregado a tu carrito de compras",
          alertType: "success",
        },
      ]);

      // Redireccionar
      res.redirect("/");
    }

    // Ya existe un carrito almacenado para el usuario
    carrito.producto.push(producto);

    // Actualizar el total del carrito
    carrito.total += producto.precio;

    // Almacenar el nuevo producto
    await carrito.save();

    req.flash("messages", [
      {
        message: "Producto agregado a tu carrito de compras",
        alertType: "success",
      },
    ]);

    res.redirect("/");
  } catch (error) {
    // console.log(error);
  }
};*/

exports.busqueda = async (req, res, next) => {
  const productos = await Producto.find({
    nombre: new RegExp(req.query.nombre, "i"),
  }).lean();
  //roles
  var usuario = false;
  var admin = false;
  var miron = false;
  var rol, nombre;
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "usuario") {
      usuario = true;
    }
  }
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "admin") {
      admin = true;
    }
  }
  if (req.isAuthenticated() != true) {
    miron = true;
  }

  let cantidad = productos.length;
  for (let i = 0; i < cantidad; i++) {
    if (productos[i].estado == "nuevo") {
      productos[i].estado = true;
    } else {
      productos[i].estado = false;
    }
  }

  res.render("buscar", { productos, usuario, admin, miron, nombre });
};

exports.informatica = async (req, res, next) => {
  const productos = await Producto.find({
    etiquetas: new RegExp("informatica", "i"),
  }).lean();
  //roles
  var usuario = false;
  var admin = false;
  var miron = false;
  var rol, nombre;
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "usuario") {
      usuario = true;
    }
  }
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "admin") {
      admin = true;
    }
  }
  if (req.isAuthenticated() != true) {
    miron = true;
  }

  let cantidad = productos.length;
  for (let i = 0; i < cantidad; i++) {
    if (productos[i].estado == "nuevo") {
      productos[i].estado = true;
    } else {
      productos[i].estado = false;
    }
  }

  res.render("buscar", { productos, usuario, admin, miron, nombre });
};

exports.electronica = async (req, res, next) => {
  const productos = await Producto.find({
    etiquetas: new RegExp("electronica", "i"),
  }).lean();
  //roles
  var usuario = false;
  var admin = false;
  var miron = false;
  var rol, nombre;
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "usuario") {
      usuario = true;
    }
  }
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "admin") {
      admin = true;
    }
  }
  if (req.isAuthenticated() != true) {
    miron = true;
  }

  let cantidad = productos.length;
  for (let i = 0; i < cantidad; i++) {
    if (productos[i].estado == "nuevo") {
      productos[i].estado = true;
    } else {
      productos[i].estado = false;
    }
  }

  res.render("buscar", { productos, usuario, admin, miron, nombre });
};

exports.seguridad = async (req, res, next) => {
  const productos = await Producto.find({
    etiquetas: new RegExp("seguridad", "i"),
  }).lean();
  //roles
  var usuario = false;
  var admin = false;
  var miron = false;
  var rol, nombre;
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "usuario") {
      usuario = true;
    }
  }
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "admin") {
      admin = true;
    }
  }
  if (req.isAuthenticated() != true) {
    miron = true;
  }

  let cantidad = productos.length;
  for (let i = 0; i < cantidad; i++) {
    if (productos[i].estado == "nuevo") {
      productos[i].estado = true;
    } else {
      productos[i].estado = false;
    }
  }

  res.render("buscar", { productos, usuario, admin, miron, nombre });
};

exports.lamparas = async (req, res, next) => {
  const productos = await Producto.find({
    etiquetas: new RegExp("lamparas", "i"),
  }).lean();
  //roles
  var usuario = false;
  var admin = false;
  var miron = false;
  var rol, nombre;
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "usuario") {
      usuario = true;
    }
  }
  if (req.isAuthenticated()) {
    rol = req.user.rol;
    nombre = req.user.nombre;
    if (rol == "admin") {
      admin = true;
    }
  }
  if (req.isAuthenticated() != true) {
    miron = true;
  }

  let cantidad = productos.length;
  for (let i = 0; i < cantidad; i++) {
    if (productos[i].estado == "nuevo") {
      productos[i].estado = true;
    } else {
      productos[i].estado = false;
    }
  }

  res.render("buscar", { productos, usuario, admin, miron, nombre });
};

exports.actualizarProducto = async (req, res, next) => {
  // Verificar que no existen errores de validación
  const errores = validationResult(req);
  const messages = [];

  // Si hay errores
  if (!errores.isEmpty()) {
    errores.array().map((error) => {
      messages.push({ message: error.msg, alertType: "danger" });
    });

    // Enviar los errores a través de flash messages
    req.flash("messages", messages);

    res.redirect("/admin/productos");
  } else {
    // Almacenar los valores del producto
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio, estado, etiquetas } = req.body;
      const imagen = [];

      for (let x = 0; x < req.files.length; x++) {
        if (req.files.length > 0) {
          imagen[x] = req.files[x].filename;
        }
        //console.log(imagen[x]);
      }

      await Producto.update({ _id: id }, req.body);
      await Producto.update({ _id: id }, { $set: { imagenes: imagen } });

      // await Producto.update({
      //   _id: id,
      //   nombre,
      //   descripcion,
      //   precio,
      //   imagenes: imagen,
      //   vendedor: req.user._id,
      //   etiquetas,
      //   estado,
      // });
      //console.log(req.files.length);
      messages.push({
        message: "¡Producto actualizado correctamente!",
        alertType: "success",
      });
      req.flash("messages", messages);

      res.redirect("/admin/productos");
    } catch (error) {
      console.log(error);
      messages.push({
        message: error,
        alertType: "danger",
      });
      req.flash("messages", messages);
      res.redirect("/admin/productos");
    }
  }
};
