const Auditlog = require('../../utils/functions/data/Auditlog');

module.exports.guildVerificationRemove = async (bot, guild) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, guild.id);
    await auditLog.setEmbed({
        text: `**${guild} is no longer verified**`,
    });
    await auditLog.sendToAuditLog({
        guildId: guild.id,
        target: guild,
    });
};
