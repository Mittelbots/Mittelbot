const Auditlog = require('../../utils/functions/data/Auditlog');

module.exports.guildOwnerUpdate = async (bot, oldGuild, newGuild) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, newGuild.guild.id);
    await auditLog.setEmbed({
        color: '#B22222',
        text: `**Owner has changed**\n**Old Owner**\n${oldGuild.owner}\n**New Owner**\n${newGuild.owner}`,
    });
    await auditLog.sendToAuditLog({
        guildId: newGuild.guild.id,
        target: newGuild.guild,
    });
};
