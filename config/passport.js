// Importar los módulos requeridos
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuarios");

// Configurar la estrategia local de autenticación
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      // Verificar si el usuario existe en la BD
      const usuario = await Usuario.findOne({ email });

      // Si el usuario no existe
      if (!usuario) {
        return done(null, false, {
          message: ["¡El correo electrónico no se encuentra registrado!"],
        });
      }

      // Si el usuario existe, verificar si la contraseña es correcta
      const verificarPassword = usuario.comparePassword(password);

      // Si la contraseña es incorrecta
      if (!verificarPassword) {
        return done(null, false, {
          message: ["¡La contraseña ingresada es incorrecta!"],
        });
      }

      // El usuario existe y la contraseña enviada es correcta
      return done(null, usuario);
    }
  )
);

// Serializar el usuario dentro de la sesión
passport.serializeUser((usuario, done) => done(null, usuario._id));

// Deserializar el usuario desde la sesión
passport.deserializeUser(async (id, done) => {
  //try {
    const usuario = await Usuario.findById(id).exec();

    return done(null, usuario);
  //} catch (error) {
    //console.log(error);
  //}
});

module.exports = passport;