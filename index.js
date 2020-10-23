// Importar modulos requeridos para el servidor
const express = require("express");
require("./config/db");
const exphbs = require("express-handlebars");
const router = require("./routes/index");
const bodyParser = require("body-parser");
//const path = require("path");
const passport = require("./config/passport");

//Habilitar el archivo de variables de entorno
require("dotenv").config({ path: ".env" });

// Crear un servidor utilizando express
const app = express();

// Habilitar Handlebars como nuestro template engine
app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));

app.set("view engine", "hbs");

// Habilitar passport y la estrategia local
app.use(passport.initialize());
app.use(passport.session());

// Habilitar body-parser para obtener el cuerpo de la petición
app.use(bodyParser.urlencoded({ extended: true }));

//Implementar router
app.use("/", router());

app.listen(process.env.PORT);