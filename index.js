// Importar modulos requeridos para el servidor
const mongoose = require("mongoose");
const express = require("express");
require("./config/db");
const exphbs = require("express-handlebars");
const router = require("./routes/index");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("./config/passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");

const cors = require("cors");
const cookieSession = require("cookie-session");
require("./config/passport");

//Habilitar el archivo de variables de entorno
require("dotenv").config({ path: ".env" });

// Crear un servidor utilizando express
const app = express();

//Hertder
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  cookieSession({
    name: "tuto-session",
    keys: ["key1", "key2"],
  })
);

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};
//-----

// Habilitar Handlebars como nuestro template engine
app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));

app.set("view engine", "hbs");
// Llama los archivos de la carpeta public
app.use(express.static(path.join(__dirname, "public")));

// Crear sesion de usuario y la cooike encargada de almacenarla
app.use(cookieParser("loquesea"));

app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Habilitar passport y la estrategia local
app.use(passport.initialize());
app.use(passport.session());

//hertder

app.get("/failed", (req, res) => res.send("/crear-cuenta"));

// In this route you can see that if the user is logged in u can acess his info in: req.user
app.get("/good", isLoggedIn, (req, res) =>
  res.send(`Welcome mr ${req.user.displayName}!`)
);

// Auth Routes
app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

//app.listen(5000, () => console.log(`Example app listening on port ${5000}!`))

//-------

// Habilitar los mensajes flash
app.use(flash());

// Midleware personalizado para agregar mensajes flash
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Habilitar body-parser para obtener el cuerpo de la petición
app.use(bodyParser.urlencoded({ extended: true }));

// Proteccion de rutas para las vistas
app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

//Implementar router
app.use("/", router());

const host = "0.0.0.0";
const port = process.env.PORT;

app.listen(port, host, () => {
  console.log(`Servidor ejecutandose en el puerto ${port}`);
});
