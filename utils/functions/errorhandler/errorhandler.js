const callerId = require('caller-id');
const Sentry = require('@sentry/node');

module.exports.errorhandler = ({ err = null, message = null, fatal = true }) => {
    const caller = callerId.getData();

    if (JSON.parse(process.env.NODE_ENV === 'development')) {
        console.error(err, '\n', message, '\n', caller.filePath);
        return;
    }

    if (fatal) {
        if (err === null) err = message;
        Sentry.captureMessage(err, 'fatal');
    } else {
        if (message === null) message = err;
        Sentry.captureMessage(message, 'info');
    }

    return;
};
