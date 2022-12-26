const Auditlog = require("../utils/functions/data/Auditlog")

module.exports.roleCreate = async (bot, role) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, role);
    await auditLog.roleCreate(role)
    await auditLog.sendToAuditLog(role)
}