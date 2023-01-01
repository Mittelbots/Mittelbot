const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.roleDelete = async (bot, role) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(role.guild.id, 'role_create');
    if (!isEnabled) return;
    await auditLog.init(bot, role);
    await auditLog.roleDelete(role);
    await auditLog.sendToAuditLog(role);
};
