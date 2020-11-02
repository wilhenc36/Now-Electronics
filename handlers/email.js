// Importar los módulos requeridos
const emailConfig = require("../config/mailtrap");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const util = require("util");

var transport = nodemailer.createTransport({
  service:'gmail',
  secure: false,
  auth:{
    user: process.env.GMAIL,
    pass: process.env.GMAILPASS,
  }
});

/*
// Configurar la capa de transporte del correo
const transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: false,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });*/

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
  from:'nowelectronics001@gmail.com',
  to: opciones.to,
  subject: opciones.subject,
  template: opciones.template,
  context: {
    resetUrl: opciones.resetUrl,
    nombre: opciones.nombre,
  },
};
/*
transport.sendMail(opcionesCorreo, function(err, info){
  if(err){
    console.log(err);
  }
  else{
    console.log('Email Sent:' + info.response);
  }
});*/

/*
// Encabezado del correo electrónico
exports.enviarCorreo = async (opciones) => {
  console.log(opciones);
    const opcionesCorreo = {
      from: " NowElectronics <nowelectronics001@gmail.com>",
      to: opciones.to,
      subject: opciones.subject,
      template: opciones.template,
      context: {
        resetUrl: opciones.resetUrl,
        //nombre: opciones.nombre,
      },
};*/

// Enviar el correo mediante una promesa
const sendMail = util.promisify(transport.sendMail, transport);
return sendMail.call(transport, opcionesCorreo);
};