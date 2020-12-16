// Importar los módulos requeridos
const emailConfig = require("../config/mailtrap");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const util = require("util");

var transport = nodemailer.createTransport({
  service: "gmail",
  secure: false,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAILPASS,
  },
});

// Template para el envío del correo
transport.use(
  "compile",
  hbs({
    viewEngine: {
      extName: ".hbs",
      partialsDir: `${__dirname}/../views/emails`,
      layouts: `${__dirname}/../views/emails`,
      defaultLayout: "",
    },
    viewPath: `${__dirname}/../views/emails`,
    extName: ".hbs",
  })
);

// Encabezado del correo electrónico
exports.enviarCorreo = async (opciones) => {
  const opcionesCorreo = {
    from: "nowelectronics001@gmail.com",
    to: opciones.to,
    subject: opciones.subject,
    template: opciones.template,
    context: {
      resetUrl: opciones.resetUrl,
      nombre: opciones.nombre,
    },
  };

  // Enviar el correo mediante una promesa
  const sendMail = util.promisify(transport.sendMail, transport);
  return sendMail.call(transport, opcionesCorreo);
};

exports.recibirCorreo = async (opciones) => {
  const opcionesCorreo = {
    from: opciones.from,
    to: "nowelectronics001@gmail.com",
    subject: opciones.subject,
    template: opciones.template,
    context: {
      nombre: opciones.nombre,
      email: opciones.email,
      telefono: opciones.telefono,
      empresa: opciones.empresa,
      mensaje: opciones.mensaje,
    },
  };

  // Enviar el correo mediante una promesa
  const sendMail = util.promisify(transport.sendMail, transport);
  return sendMail.call(transport, opcionesCorreo);
};
