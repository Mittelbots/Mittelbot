const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.messageDelete = async (bot, message) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, message.guild.id);
    await auditLog.messageDelete(message);
    await auditLog.sendToAuditLog(message);
};
