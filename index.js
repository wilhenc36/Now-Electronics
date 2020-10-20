// Importar modulos requeridos para el servidor
const express = require("express");
const exphbs = require("express-handlebars");

//Habilitar el archivo de variables de entorno
require("dotenv").config({ path: ".env" });

// Crear un servidor utilizando express
const app = express();

// Inicializar el servidor en un puerto en específico
app.use("/", (req, res, next) => {
    res.send("Bienvenido a Now Electronics!");
});

app.listen(process.env.PORT);