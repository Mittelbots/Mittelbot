const callerId = require('caller-id');
const Sentry = require('@sentry/node');

module.exports.errorhandler = ({ err = null, message = null, fatal = true }) => {
    const caller = callerId.getData();

    if (JSON.parse(process.env.NODE_ENV === 'development')) {
        console.error(err, '\n', message, '\n', caller.filePath);
        return;
    }

    const errString = err + (message ? ' -- ' + message : '');

    if (fatal) {
        Sentry.captureMessage(errString, 'fatal');
    } else {
        Sentry.captureMessage(errString, 'debug');
    }

    return;
};
