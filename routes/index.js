// Importar los módulos requeridos
const express = require("express");
const usuarioController = require("../controllers/usuarioController");
const authController = require("../controllers/authController");
const productoController = require("../controllers/productoController");
const homeController = require("../controllers/homeController");
const { check } = require("express-validator");
const Carrito = require("../models/Carrito");
const Producto = require("../models/Producto");

// Configura y mantiene todos los endpoints en el servidor
const router = express.Router();

module.exports = () => {
  // Rutas disponibles
  router.get("/", homeController.mostrarProductos);

  router.get("/cerrar-sesion", authController.cerrarSesion);

  // Rutas para usuario
  router.get("/crear-cuenta", usuarioController.formularioCrearCuenta);

  router.post(
    "/crear-cuenta",
    [
      // Realizar una verificación de los atributos del formulario
      // https://express-validator.github.io/docs/index.html
      check("nombre", "Debes ingresar tu nombre completo.")
        .not()
        .isEmpty()
        .escape(),
      check("email", "Debes ingresar un correo electrónico.").not().isEmpty(),
      check("email", "El correo electrónico ingresado no es válido.")
        .isEmail()
        .normalizeEmail(),
      check("password", "Debes ingresar una contraseña").not().isEmpty(),
    ],
    usuarioController.crearCuenta
  );

  router.get("/iniciar-sesion", usuarioController.formularioIniciarSesion);

  router.post("/iniciar-sesion", authController.autenticarUsuario);

  router.get("/olvide-password", authController.formularioRestablecerPassword);

  router.post("/olvide-password", authController.enviarToken);

  router.get("/olvide-password/:token", authController.formularioNuevoPassword);

  router.post("/olvide-password/:token", authController.almacenarNuevaPassword);

  // Rutas de administración
  router.get("/administrar", (req, res, next) => {
    res.send("Administración del sitio");
  });

  //Cerrar Sesion
  router.get("/salir", authController.cerrarSesion);

  // Rutas sobreNosotros
  router.get("/sobreNosotros", (req, res, next) => {
    res.render("sobreNosotros");
  });

  // Rutas para productos
  router.get(
    "/crear-producto",
    authController.verificarInicioSesion,
    productoController.formularioCrearProducto
  );

  router.post(
    "/crear-producto",
    authController.verificarInicioSesion,
    /*[
      check("imagen", "Debes seleccionar una imagen para el producto")
        .not()
        .isEmpty(),
    ],*/
    productoController.subirImagen,
    [
      check("nombre", "Debes ingresar el nombre del producto")
        .not()
        .isEmpty()
        .escape(),
      check("descripcion", "Debes ingresar la descripción del producto")
        .not()
        .isEmpty()
        .escape(),
      check("precio", "Debes ingresar el precio del producto")
        .not()
        .isEmpty()
        .escape(),
      check("precio", "Valor incorrecto en el precio del producto").isNumeric(),
    ],
    productoController.crearProducto
  );

  router.get("/producto/:url", authController.verificarInicioSesion, productoController.verProducto);

  router.get("/carrito/:id", authController.verificarInicioSesion, function (req, res, next) {
    var productoId = req.params.id;
    var carrito = new Carrito(req.session.carrito ? req.session.carrito : {});

    Producto.findById(productoId, function (err, producto) {
      if (err) {
        return res.redirect("/");
      }
      carrito.add(producto, producto.id);
      req.session.carrito = carrito;
      console.log(req.session.carrito);
      res.redirect("/");
    });
    req.flash("messages", [
      {
        message: "Producto agregado a tu carrito de compras",
        alertType: "success",
      },
    ]);

  });

  router.get("/carrito", authController.verificarInicioSesion, function (req, res, next) {
    if (!req.session.carrito) {
      return res.render("carrito", { producto: null });
    }
    var carrito = new Carrito(req.session.carrito);
    res.render("carrito", { producto: carrito.generarArray(), precioTotal: carrito.precioTotal });
  });

  router.get('/eliminar/:id', (req, res, next) => {
    var productoId = req.params.id;
    var carrito = new Carrito(req.session.carrito ? req.session.carrito : { items: {} });
    carrito.eliminarItems(productoId);
    req.session.carrito = carrito;
    res.redirect('/carrito');

  });

  router.get('/reducir/:id', (req, res, next) => {
    var productoId = req.params.id;
    var carrito = new Carrito(req.session.carrito ? req.session.carrito : { items: {} });
    carrito.reducirItem(productoId);
    req.session.carrito = carrito;
    res.redirect('/carrito');

  });

  router.get("/pago", function(req, res, next) {
    //var carrito = new Carrito(req.session.carrito);
    
    
      req.session.carrito = null;
      return res.render("pago")
  });

  /*
    router.get(
      "/carrito/:url",
      authController.verificarInicioSesion,
      productoController.agregarProductoCarrito
    );
  */
  return router;
};