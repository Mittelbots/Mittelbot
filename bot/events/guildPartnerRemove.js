const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildPartnerRemove = async (bot, guild) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, guild.id);
    await auditLog.setEmbed({
        text: `**${guild} is no longer partnered**`,
    });
    await auditLog.sendToAuditLog({
        guildId: guild.id,
        target: guild,
    });
};
