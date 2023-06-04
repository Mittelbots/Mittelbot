const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildAfkChannelAdd = async (bot, guild, afkChannel) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, guild.id);
    await auditLog.setEmbed({
        text: `**${guild} has added an AFK channel**\n**AFK channel**\n${afkChannel}`,
    });
    await auditLog.sendToAuditLog({
        guildId: guild.id,
        target: guild,
    });
};
