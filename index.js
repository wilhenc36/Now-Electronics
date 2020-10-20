// Importar modulos requeridos para el servidor
const express = require("express");
const exphbs = require("express-handlebars");
const router = require("./routes/index");

//Habilitar el archivo de variables de entorno
require("dotenv").config({ path: ".env" });

// Crear un servidor utilizando express
const app = express();

//Implementar router
app.use("/", router());

app.listen(process.env.PORT);