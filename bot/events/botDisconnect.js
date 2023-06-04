const Auditlog = require('~utils/classes/Auditlog');

module.exports.botDisconnect = async (bot, info) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, 'disc');
    await auditLog.setEmbed({
        color: '#a80f2b',
        text: `**WebSocket Disconnected** \n ${info}`,
    });
    await auditLog.send();
};
