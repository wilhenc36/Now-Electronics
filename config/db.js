// Módulos requeridos
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env"});

// Configuración de Mongoose
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Iniciar la conexión al servidor cloud mongo
mongoose.connection.on("error", error => {
    console.log(error);
  });