//Importar modulos requeridos
const express = require("express");
const usuarioController = require("../controllers/usuarioController");

//Configurar y mantiene todos los endpoints en el servidor
const router = express.Router();

module.exports = () => {
    // Rutas disponibles
    router.get("/", (req, res, next) => {
        res.send("Bienvenido a Now Electronics!");
    });

    // Rutas para usuario
    router.get("/crear-cuenta", usuarioController.formularioCrearCuenta);

    router.post("/registrarse", usuarioController.crearCuenta);

    router.get("/iniciar-sesion", usuarioController.formularioIniciarSesion);

    return router;
};