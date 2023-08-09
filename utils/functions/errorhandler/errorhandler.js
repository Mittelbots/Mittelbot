const callerId = require('caller-id');
const Sentry = require('@sentry/node');
const { getSession, removeSession } = require('~src/assets/js/sessionID');

module.exports.errorhandler = ({ err = null, message = null, fatal = true }) => {
    const caller = callerId.getData();

    if (JSON.parse(process.env.NODE_ENV === 'development')) {
        console.error(err, '\n', message, '\n', caller.filePath);
        return;
    }

    const session = getSession();

    Sentry.addBreadcrumb({
        category: 'Saved Session',
        message: JSON.stringify(session),
    });

    if (fatal) {
        if (err === null) err = message;

        Sentry.captureException(err);
    } else {
        if (message === null) message = err;
        Sentry.captureMessage(message);
    }

    removeSession();
    return;
};
