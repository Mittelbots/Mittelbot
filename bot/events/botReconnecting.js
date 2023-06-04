const Auditlog = require('~utils/classes/Auditlog');

module.exports.botReconnecting = async (bot, info) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, 'reco');
    await auditLog.setEmbed({
        color: '#a80f2b',
        text: `**WebSocket Reconnecting** \n ${info}`,
    });
    await auditLog.send();
};
