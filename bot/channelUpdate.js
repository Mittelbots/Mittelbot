const Auditlog = require("../utils/functions/data/Auditlog")

module.exports.channelUpdate = async (bot, channelBefore, channelAfter) => {
    const auditLog = new Auditlog()
    await auditLog.init(bot, channelBefore.guild.id)
    await auditLog.channelUpdate(channelBefore, channelAfter)
    await auditLog.sendToAuditLog(channelBefore)
}