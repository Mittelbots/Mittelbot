const Auditlog = require('../../utils/functions/data/Auditlog');

module.exports.guildVanityURLAdd = async (bot, guild, vanityURL) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, guild.id);
    await auditLog.setEmbed({
        text: `**Vanity URL added to ${guild}**\n**URL**\n${vanityURL}`,
    });
    await auditLog.sendToAuditLog({
        guildId: guild.id,
        target: guild,
    });
};
