const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.roleCreate = async (bot, role) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(role.guild.id, 'role_create');
    if (!isEnabled) return;
    await auditLog.init(bot, role);
    await auditLog.roleCreate(role);
    await auditLog.sendToAuditLog(role);
};
