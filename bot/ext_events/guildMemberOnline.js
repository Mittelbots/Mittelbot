const Auditlog = require('../../utils/functions/data/Auditlog');

module.exports.guildMemberOnline = async (bot, member) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(member.guild.id, 'guildMemberOnline');
    if (!isEnabled) return;
    await auditLog.init(bot, member.guild.id);
    await auditLog.setEmbed({
        text: `**${member} is now online**`,
    });
    await auditLog.sendToAuditLog({
        guildId: member.guild.id,
        target: member,
        checkWhiteList: true,
    });
};
