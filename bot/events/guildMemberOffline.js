const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildMemberOffline = async (bot, member, oldStatus) => {
    try {
        const auditLog = new Auditlog();
        const isEnabled = await auditLog.checkEnabledEvents(member.guild.id, 'guildMemberOffline');
        if (!isEnabled) return;
        await auditLog.init(bot, member.guild.id, true);
        await auditLog.setEmbed({
            text: `**${member} is now offline**\n\n**Status:** ${oldStatus}`,
        });
        await auditLog.sendToAuditLog({
            guildId: member.guild.id,
            target: member,
        });
    } catch (error) {}
};
