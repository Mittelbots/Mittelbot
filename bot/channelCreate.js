const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.channelCreate = async (bot, channel) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(channel.guild.id, 'channel_create');
    if (!isEnabled) return;
    await auditLog.init(bot, channel.guild.id);
    await auditLog.channelCreate(channel);
    await auditLog.sendToAuditLog(channel);
};
