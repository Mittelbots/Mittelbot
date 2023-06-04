const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildVanityURLUpdate = async (bot, guild, oldvanityURL, newVanityURL) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, guild.id);
    await auditLog.setEmbed({
        text: `**Vanity URL updated in ${guild}**\n**Old URL**\n${oldvanityURL}\n**New URL**\n${newVanityURL}`,
    });
    await auditLog.sendToAuditLog({
        guildId: guild.id,
        target: guild,
    });
};
