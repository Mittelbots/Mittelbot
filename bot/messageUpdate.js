const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.messageUpdate = async (bot, messageBefore, messageAfter) => {
    if (messageBefore.content === messageAfter.content) return;
    const auditLog = new Auditlog();
    await auditLog.init(bot, messageBefore.guild.id);
    await auditLog.messageUpdate(messageBefore, messageAfter);
    await auditLog.sendToAuditLog(messageBefore, 'messagelog');
};
