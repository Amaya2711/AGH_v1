require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail({
  from: `Prueba SMTP <${process.env.SMTP_USER}>`,
  to: process.env.SMTP_USER, // Puedes poner otro correo para probar
  subject: 'Prueba de conexión SMTP',
  text: '¡La conexión SMTP funciona correctamente!',
}, (error, info) => {
  if (error) {
    return console.log('Error al enviar:', error);
  }
  console.log('Correo enviado:', info.response);
});
