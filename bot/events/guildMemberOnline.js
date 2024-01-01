const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildMemberOnline = async (bot, member, newStatus) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(member.guild.id, 'guildMemberOnline');
    if (!isEnabled) return;
    await auditLog.init(bot, member.guild.id, true);
    await auditLog.setEmbed({
        text: `**${member} is now online**\n\n**Status:** ${newStatus}`,
    });
    await auditLog.sendToAuditLog({
        guildId: member.guild.id,
        target: member,
    });
};
