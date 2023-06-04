const Auditlog = require('~utils/classes/Auditlog');

module.exports.userUsernameUpdate = async (bot, member, oldUsername, newUsername) => {
    try {
        const auditLog = new Auditlog();
        const isEnabled = await auditLog.checkEnabledEvents(member.guild.id, 'userUsernameUpdate');
        if (!isEnabled) return;
        await auditLog.init(bot, member.guild.id, true);
        await auditLog.setEmbed({
            text: `**${member} has updated their username **\n**Old username**\n${oldUsername}\n**New username**\n${newUsername}`,
        });
        await auditLog.sendToAuditLog({
            guildId: member.guild.id,
            target: member,
        });
    } catch (err) {}
};
