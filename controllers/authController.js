// Importar los módulos requeridos
const passport = require("passport");
const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuarios");

// Se encarga de autenticar el usuario y de redireccionarlo
exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/administrar",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: ["Debes ingresar tus credenciales"],
});

// Cerrar la sesión del usuario
exports.cerrarSesion = (req, res, next) => {
  // Cierra la sesión
  req.logout();

  req.flash("success", [
    "Has cerrado correctamente tu sesión. ¡Vuelve pronto!",
  ]);

  return res.redirect("/iniciar-sesion");
};