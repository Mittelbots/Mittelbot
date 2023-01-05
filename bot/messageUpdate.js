const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.messageUpdate = async (bot, messageBefore, messageAfter) => {
    if (messageBefore.content === messageAfter.content) return;
    if (messageBefore == null || messageAfter == null) return;
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(messageBefore.guild.id, 'message_update');
    if (!isEnabled) return;
    await auditLog.init(bot, messageBefore.guild.id);
    await auditLog.messageUpdate(messageBefore, messageAfter);
    await auditLog.sendToAuditLog(messageBefore, 'messagelog');
};
