const callerId = require('caller-id');
const Sentry = require('@sentry/node');
const { getSession, removeSession } = require('~src/assets/js/sessionID');
const { debug_log } = require('./debugLogs');

module.exports.errorhandler = ({ err = null, message = null, fatal = true, id = null }) => {
    const caller = callerId.getData();

    if (JSON.parse(process.env.NODE_ENV === 'development')) {
        console.error(err, '\n', message, '\n', caller.filePath);
        return;
    }

    if (fatal) {
        if (err === null) err = message;

        const session = getSession();
        Sentry.addBreadcrumb({
            category: 'Saved Session',
            message: JSON.stringify(session),
        });

        Sentry.captureException(err);

        removeSession();
        return;
    }

    if (message === null) message = err;
    debug_log.info(
        `${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString(
            'de-DE'
        )} || ${id} - ${message}`
    );
};
