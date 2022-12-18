const Auditlog = require("../utils/functions/data/Auditlog")

module.exports.messageDelete = async (bot, message) => {
    const auditLog = await new Auditlog(bot, message.guild.id)
    await auditLog.messageDelete(message)
    await auditLog.sendToAuditLog(message)
}