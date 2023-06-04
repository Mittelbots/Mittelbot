const Auditlog = require('~utils/classes/Auditlog');

module.exports.channelDelete = async (bot, channel) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(channel.guild.id, 'channel_delete');
    if (!isEnabled) return;
    await auditLog.init(bot, channel.guild.id);
    await auditLog.setEmbed({
        color: '#a80f2b',
        text: `**Channel deleted: ${channel.name}**`,
    });
    await auditLog.sendToAuditLog({
        guildId: channel.guild.id,
        target: channel.guild,
    });
};
