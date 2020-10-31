//Importar modulos requeridos
const express = require("express");
const usuarioController = require("../controllers/usuarioController");
const authController = require("../controllers/authController");
const { check } = require("express-validator");

//Configurar y mantiene todos los endpoints en el servidor
const router = express.Router();

module.exports = () => {
    // Rutas disponibles
    router.get("/", (req, res, next) => {
        res.send("Bienvenido a Now Electronics!");
    });

    // Rutas para usuario
    router.get("/crear-cuenta", usuarioController.formularioCrearCuenta);

    router.post(
        "/registrarse",
    [
    // Realizar una verificacion de los atributos del formulario
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
    
    //Rutas de administracion
    router.get("/administrar", (req, res, next) => {
        res.send("Administracion del sitio");
    })

    return router;
};