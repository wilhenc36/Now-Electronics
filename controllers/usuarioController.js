// Importar los módulos requeridos
const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuarios");

const year = new Date().getFullYear();

// Cargar el formulario de la creación de una cuenta de usuario
exports.formularioCrearCuenta = (req, res, next) => {
   res.render("registrarse", {
    layout: "auth",
    typePage: "register-page",
    signButtonValue: "/iniciar-sesion",
    signButtonText: "Iniciar sesión",
    year,
  });
};

// Procesar el formulario de creación de cuenta
exports.crearCuenta = async (req, res, next) => {
  // Obtener las variables desde el cuerpo de la petición
  const { nombre, email, password } = req.body;

  // Intentar almacenar los datos del usuario
  try {
    // Crear el usuario
    // https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Promise
    // https://developer.mozilla.org/es/docs/Learn/JavaScript/Asynchronous/Async_await
    await Usuario.create({
      email,
      password,
      nombre,
    });

    // Mostrar un mensaje
  } catch (error) {
    console.log(error);
  }
};

// Cargar el formulairo de iniciar sesión
exports.formularioIniciarSesion = (req, res, next) =>{
  res.render("iniciarSesion", { layout: "auth" });
};