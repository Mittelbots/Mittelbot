const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.channelDelete = async (bot, channel) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(channel.guild.id, 'channel_delete');
    if (!isEnabled) return;
    await auditLog.init(bot, channel.guild.id);
    await auditLog.channelDelete(channel);
    await auditLog.sendToAuditLog(channel);
};
