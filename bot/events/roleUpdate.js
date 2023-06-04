const Auditlog = require('~utils/classes/Auditlog');

module.exports.roleUpdate = async (bot, roleBefore, roleAfter) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(roleBefore.guild.id, 'role_update');
    if (!isEnabled) return;
    await auditLog.init(bot, roleBefore.guild.id);
    const succeed = await auditLog.roleUpdate(roleBefore, roleAfter);
    if (!succeed) return;
    await auditLog.sendToAuditLog({
        guildId: roleBefore.guild.id,
        target: roleBefore.guild,
    });
};
