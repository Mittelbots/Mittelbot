const Auditlog = require("../utils/functions/data/Auditlog")

module.exports.roleUpdate = async (bot, roleBefore, roleAfter) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, roleBefore.guild.id);
    await auditLog.roleUpdate(roleBefore, roleAfter)
    await auditLog.sendToAuditLog(roleBefore)
}