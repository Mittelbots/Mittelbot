const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.messageDelete = async (bot, message) => {
    if (!message.author) return;
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(message.guild.id, 'message_delete');
    if (!isEnabled) return;
    await auditLog.init(bot, message.guild.id);
    await auditLog.messageDelete(message);
    await auditLog.sendToAuditLog({
        guildId: message.guild.id,
        target: message,
    });
};
