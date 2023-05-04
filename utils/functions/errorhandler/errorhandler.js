const callerId = require('caller-id');
const Sentry = require('@sentry/node');

module.exports.errorhandler = ({
    err = 'No error passed! ',
    message = 'No message passed! ',
    channel = null,
    fatal = true,
    databaseError = false,
}) => {
    if (JSON.parse(process.env.NODE_ENV === 'development')) {
        console.error(err, '\n', message, '\n', caller.filePath);
        return;
    }

    const caller = callerId.getData();
    let errObj = {
        Message: message,
        'Called From': caller.filePath,
        Line: caller.lineNumber,
        '------------': '------------',
    };

    err = err + '\n' + JSON.stringify(errObj, null, 2);

    if (databaseError) {
        Sentry.captureMessage(err, 'fatal');
    } else if (fatal) {
        Sentry.captureMessage(err, 'fatal');
    } else if (!fatal) {
        Sentry.captureMessage(err, 'debug');
    }

    return;
};
