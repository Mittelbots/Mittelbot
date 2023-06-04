const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildMemberRoleAdd = async (bot, member, role) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(
        member.guild.id,
        'guildMemberNicknameUpdate'
    );
    if (!isEnabled) return;
    await auditLog.init(bot, member.guild.id, true);
    await auditLog.setEmbed({
        text: `**Role added to ${member}**\n**Role**\n${role}`,
    });
    await auditLog.sendToAuditLog({
        guildId: member.guild.id,
        target: member,
    });
};
