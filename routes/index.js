//Importar modulos requeridos
const express = require("express");

//Configurar y mantiene todos los endpoints en el servidor
const router = express.Router();

module.exports = () => {
    // Rutas disponibles
    router.get("/", (req, res, next) => {
        res.send("Bienvenido a Now Electronics!");
    });

    return router;
}