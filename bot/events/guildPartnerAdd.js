const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildPartnerAdd = async (bot, guild) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, guild.id);
    await auditLog.setEmbed({
        text: `**${guild} got partnered! Well deserved!!!**`,
    });
    await auditLog.sendToAuditLog({
        guildId: guild.id,
        target: guild,
    });
};
