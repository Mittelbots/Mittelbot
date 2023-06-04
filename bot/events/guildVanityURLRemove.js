const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildVanityURLRemove = async (bot, guild, vanityURL) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, guild.id);
    await auditLog.setEmbed({
        text: `**Vanity URL removed to ${guild}**\n**URL**\n${vanityURL}`,
    });
    await auditLog.sendToAuditLog({
        guildId: guild.id,
        target: guild,
    });
};
