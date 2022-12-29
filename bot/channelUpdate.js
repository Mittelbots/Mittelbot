const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.channelUpdate = async (bot, channelBefore, channelAfter) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, channelBefore.guild.id);
    const succeed = await auditLog.channelUpdate(channelBefore, channelAfter);
    if (!succeed) return;
    await auditLog.sendToAuditLog(channelBefore);
};
