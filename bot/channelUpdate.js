const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.channelUpdate = async (bot, channelBefore, channelAfter) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(channelBefore.guild.id, 'channel_update');
    if (!isEnabled) return;
    await auditLog.init(bot, channelBefore.guild.id);
    const succeed = await auditLog.channelUpdate(channelBefore, channelAfter);
    if (!succeed) return;
    await auditLog.sendToAuditLog({
        guildId: channelBefore.guild.id,
        target: channelBefore.guild,
    });
};
