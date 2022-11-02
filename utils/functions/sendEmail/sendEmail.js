const nodemailer = require('nodemailer');
const { errorhandler } = require('../errorhandler/errorhandler');

const transporter = nodemailer.createTransport({
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    secure: JSON.parse(process.env.EMAIL_SECURE),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PWD,
    },
});

module.exports.sendEmailToOwner = async (err) => {
    var message = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Mittelbot stopped working after too many restarts.',
        text: err,
    };
    transporter.sendMail(message, (error, info) => {
        if (error) {
            return errorhandler({
                err,
                fatal: true,
            });
        }
    });
    return;
};
