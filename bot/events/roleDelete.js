const Auditlog = require('~utils/classes/Auditlog');

module.exports.roleDelete = async (bot, role) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(role.guild.id, 'role_delete');
    if (!isEnabled) return;
    await auditLog.init(bot, role);
    await auditLog.setEmbed({
        color: '#a80f2b',
        text: `**Role deleted: ${role.name}**`,
    });
    await auditLog.sendToAuditLog({
        guildId: role.guild.id,
        target: role,
    });
};
