const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.channelCreate = async (bot, channel) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, channel.guild.id);
    await auditLog.channelCreate(channel);
    await auditLog.sendToAuditLog(channel);
};
