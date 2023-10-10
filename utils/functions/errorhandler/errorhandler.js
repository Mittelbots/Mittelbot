const callerId = require('caller-id');
const Sentry = require('@sentry/node');
const { getSession, removeSession } = require('~src/assets/js/sessionID');
const { debug_log } = require('./debugLogs');
const { EmbedBuilder } = require('discord.js');

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

    const debugMessage = `${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString(
        'de-DE'
    )} || ${id} - ${message}`;

    debug_log.info(debugMessage);

    global.bot.channels.cache
        .get(process.env.DC_DEBUGLOGS)
        .send({
            embeds: [new EmbedBuilder().setDescription(debugMessage).setTimestamp()],
        })
        .catch(() => null);
};
