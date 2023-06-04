const Auditlog = require('~utils/classes/Auditlog');

module.exports.channelCreate = async (bot, channel) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(channel.guild.id, 'channel_create');
    if (!isEnabled) return;
    await auditLog.init(bot, channel.guild.id);
    await auditLog.setEmbed({
        color: '#36d30a',
        text: `**Channel created: <#${channel.id}>**`,
    });
    await auditLog.sendToAuditLog({
        guildId: channel.guild.id,
        target: channel.guild,
    });
};
