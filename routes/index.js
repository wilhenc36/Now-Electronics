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

  // Rutas de administración
  router.get("/mapa", (req, res, next) => {
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

    res.render("mapa", { usuario, admin, miron, nombre });
  });

  router.post("/mapa", authController.recibirCorreo);

  //Cerrar Sesion
  router.get("/salir", authController.cerrarSesion);

  // Rutas sobreNosotros
  router.get("/sobreNosotros", (req, res, next) => {
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

    res.render("sobreNosotros", { usuario, admin, miron, nombre });
  });

  // Rutas para productos
  router.get(
    "/crear-producto",
    authController.verificarInicioSesion,
    productoController.formularioCrearProducto
  );

  router.post(
    "/admin/productos/nuevo",
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

  router.get(
    "/producto/:url",
    authController.verificarInicioSesion,
    productoController.verProducto
  );

  router.get(
    "/carrito/:id",
    authController.verificarInicioSesion,
    function (req, res, next) {
      var productoId = req.params.id;
      var carrito = new Carrito(req.session.carrito ? req.session.carrito : {});

      Producto.findById(productoId, function (err, producto) {
        if (err) {
          return res.redirect("/");
        }
        carrito.add(producto, producto.id);
        req.session.carrito = carrito;
        res.redirect("/");
      });
      req.flash("messages", [
        {
          message: "Producto agregado a tu carrito de compras",
          alertType: "success",
        },
      ]);
    }
  );

  router.get(
    "/carrito",
    authController.verificarInicioSesion,
    function (req, res, next) {
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

      if (!req.session.carrito) {
        return res.render("carrito", {
          producto: false,
          usuario,
          admin,
          miron,
          nombre,
        });
      }
      var carrito = new Carrito(req.session.carrito);
      res.render("carrito", {
        producto: carrito.generarArray(),
        precioTotal: carrito.precioTotal,
        usuario,
        admin,
        miron,
        nombre,
      });
    }
  );

  router.get("/eliminar/:id", (req, res, next) => {
    var productoId = req.params.id;
    var carrito = new Carrito(
      req.session.carrito ? req.session.carrito : { items: {} }
    );
    carrito.eliminarItems(productoId);
    req.session.carrito = carrito;
    res.redirect("/carrito");
  });

  router.get("/reducir/:id", (req, res, next) => {
    var productoId = req.params.id;
    var carrito = new Carrito(
      req.session.carrito ? req.session.carrito : { items: {} }
    );
    carrito.reducirItem(productoId);
    req.session.carrito = carrito;
    res.redirect("/carrito");
  });

  router.get("/pago", function (req, res, next) {
    //var carrito = new Carrito(req.session.carrito);
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

    req.session.carrito = null;
    return res.render("pago", { usuario, admin, miron, nombre });
  });

  /*
      router.get(
        "/carrito/:url",
        authController.verificarInicioSesion,
        productoController.agregarProductoCarrito
      );
    */

  router.get("/terminos-y-condiciones", (req, res, next) => {
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

    res.render("terminosCondiciones", { usuario, admin, miron, nombre });
  });

  router.get("/garantia", (req, res, next) => {
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

    res.render("garantia", { usuario, admin, miron, nombre });
  });

  router.get("/productos/busqueda/", productoController.busqueda);

  router.get(
    "/perfil",
    authController.verificarInicioSesion,
    usuarioController.perfil
  );

  router.get("/categorias/informatica", productoController.informatica);

  router.get("/categorias/electronica", productoController.electronica);

  router.get("/categorias/seguridad", productoController.seguridad);

  router.get("/categorias/lamparas", productoController.lamparas);

  router.get("/cyber-week", productoController.cyberweek);

  router.get(
    "/admin",
    authController.verificarInicioSesion,
    (req, res, next) => {
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

      res.render("Admin/admin", {
        layout: "admin",
        admin,
        nombre,
      });
    }
  );

  router.get(
    "/admin/productos",
    authController.verificarInicioSesion,
    async (req, res, next) => {
      const productos = await Producto.find().lean();
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

      res.render("Admin/productos", {
        layout: "admin",
        productos,
        admin,
        nombre,
      });
    }
  );

  router.get(
    "/admin/usuarios",
    authController.verificarInicioSesion,
    (req, res, next) => {
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

      res.render("Admin/usuarios", {
        layout: "admin",
        admin,
        nombre,
      });
    }
  );

  router.get(
    "/admin/productos/nuevo",
    authController.verificarInicioSesion,
    (req, res, next) => {
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

      res.render("Admin/productosNuevo", {
        layout: "admin",
        admin,
        nombre,
      });
    }
  );

  router.get("/admin/productos/eliminar/:id", async (req, res, next) => {
    const messages = [];
    const { id } = req.params;
    await Producto.deleteOne({ _id: id });

    messages.push({
      message: "¡Producto eliminado correctamente!",
      alertType: "success",
    });
    req.flash("messages", messages);

    res.redirect("/admin/productos");
  });

  router.get("/admin/productos/editar/:id", async (req, res, next) => {
    const { id } = req.params;
    const producto = await Producto.findById(id).lean();
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

    res.render("Admin/productoEditar", {
      layout: "admin",
      producto,
      admin,
      nombre,
    });
  });

  router.post(
    "/admin/productos/editar/:id",
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
    productoController.actualizarProducto
  );

  router.get("/ayuda", (req, res, next) => {
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

    res.render("ayuda", { usuario, admin, miron, nombre });
  });

  router.get("*", (req, res, next) => {
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

    res.render("404error", { usuario, admin, miron, nombre });
  });

  return router;
};
