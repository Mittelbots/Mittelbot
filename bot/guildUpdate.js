const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.guildUpdate = async (bot, guildBefore, guildAfter) => {
    const auditLog = new Auditlog();
    guildBefore.guild.id = guildBefore.guildId;
    await auditLog.init(bot, guildBefore.guildId);
    await auditLog.guildUpdate(guildBefore, guildAfter);
    await auditLog.sendToAuditLog(guildBefore);
};
