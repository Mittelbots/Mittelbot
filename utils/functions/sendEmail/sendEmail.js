const config = require('../../../src/assets/json/_config/config.json');
const nodemailer = require('nodemailer');
const {
    errorhandler
} = require('../errorhandler/errorhandler');

const transporter = nodemailer.createTransport({
    port: config.email.port,
    host: config.email.host,
    secure: config.email.secure,
    auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
    }
});

module.exports.sendEmailToOwner = async (err) => {
    var message = {
      from: config.email.email,
      to: email,
      subject: 'Mittelbot stopped working after too many restarts.',
      text: err
    };
    transporter.sendMail(message, (error, info) => {
      if (error) {
        return errorhandler({
            err,
            fatal: true
        })
      }
    });
    return;
}