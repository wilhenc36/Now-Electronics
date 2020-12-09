// Importar los módulos requeridos
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuarios");

// Configurar la estrategia local de autenticación
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      // Verificar si el usuario existe en la BD
      const usuario = await Usuario.findOne({ email });

      // Si el usuario no existe
      if (!usuario) {
        return done(
          null,
          false,
          req.flash("messages", [
            {
              message: "¡El correo electrónico no se encuentra registrado!",
              alertType: "danger",
            },
          ])
        );
      }

      // Si el usuario existe, verificar si la contraseña es correcta
      const verificarPassword = await usuario.comparePassword(password);

      // Si la contraseña es incorrecta
      if (!verificarPassword) {
        return done(
          null,
          false,
          req.flash("messages", [
            {
              message: "¡La contraseña ingresada es incorrecta!",
              alertType: "danger",
            },
          ])
        );
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
  try {
    const usuario = await Usuario.findById(id).exec();

    return done(null, usuario);
  } catch (error) {
    console.log(error);
  }
});

passport.use(new GoogleStrategy({
  clientID: "275422642013-sn4mav3f5cga8kkv6i1r9j59lrdqrjo0.apps.googleusercontent.com",
  clientSecret: "oBbhZvvvLYp9yVa4vpszhAEY",
  callbackURL: "http://localhost:5000/google/callback"
},



function(accessToken, refreshToken, profile, done) {
  /*
   use the profile info (mainly profile id) to check if the user is registerd in ur db
   If yes select the user and pass him to the done callback
   If not create the user and then select him and pass to callback
  */
  return done(null, profile);
}
));

passport.serializeUser(function(user, done) {
  /*
  From the user take just the id (to minimize the cookie size) and just pass the id of the user
  to the done callback
  PS: You dont have to do it like this its just usually done like this
  */
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  /*
  Instead of user this function usually recives the id 
  then you use the id to select the user from the db and pass the user obj to the done callback
  PS: You can later access this data in any routes in: req.user
  */
  done(null, user);
});



module.exports = passport;