const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.roleDelete = async (bot, role) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, role);
    await auditLog.roleDelete(role);
    await auditLog.sendToAuditLog(role);
};
