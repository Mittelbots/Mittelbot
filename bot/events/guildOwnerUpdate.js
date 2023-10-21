const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildOwnerUpdate = async (bot, oldGuild, newGuild) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, newGuild.id);
    await auditLog.setEmbed({
        color: '#B22222',
        text: `**Owner has changed**\n**Old Owner**\n${oldGuild.owner}\n**New Owner**\n${newGuild.owner}`,
    });
    await auditLog.sendToAuditLog({
        guildId: newGuild.id,
        target: newGuild,
    });
};
