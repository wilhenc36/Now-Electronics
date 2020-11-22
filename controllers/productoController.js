// Importar los módulos requeridos
const mongoose = require("mongoose");
const Producto = mongoose.model("Producto");
const { validationResult } = require("express-validator");
const multer = require("multer");
const shortid = require("shortid");

const year = new Date().getFullYear();

// Mostrar el formulario de creación de producto
exports.formularioCrearProducto = (req, res, next) => {
  res.render("crearProducto", {
    year,
  });
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

    res.redirect("/crear-producto");
  } else {
    // Almacenar los valores del producto
    try {
      const { nombre, descripcion, precio, estado } = req.body;

      await Producto.create({
        nombre,
        descripcion,
        precio,
        imagen: req.file.filename,
        vendedor: req.user._id,
      });

      messages.push({
        message: "¡Producto agregado correctamente!",
        alertType: "success",
      });
      req.flash("messages", messages);

      res.redirect("/crear-producto");
    } catch (error) {
      console.log(error);
      messages.push({
        message: error,
        alertType: "danger",
      });
      req.flash("messages", messages);
      res.redirect("/crear-producto");
    }
  }

  // res.redirect("/crear-producto");
};

// Permite subir un archivo (imagen) al servidor
exports.subirImagen = (req, res, next) => {
  // Verificar que no existen errores de validación
  const errores = validationResult(req);
  const messages = [];

  if (!errores.isEmpty) {
    errores.array().map((error) => {
      messages.push({ message: error.msg, alertType: "danger" });
    });

    req.flash("messages", messages);
    res.redirect("/crear-producto");
  } else {
    // Subir el archivo mediante Multer
    upload(req, res, function (error) {
      console.log(req.body);
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
        res.redirect("/crear-producto");
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
    fileSize: 300000,
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

// Función que sube el archivo
const upload = multer(configuracionMulter).single("imagen");