const Auditlog = require('~utils/classes/Auditlog');

module.exports.userAvatarUpdate = async (bot, member, oldAvatarURL, newAvatarURL) => {
    try {
        const auditLog = new Auditlog();
        const isEnabled = await auditLog.checkEnabledEvents(member.guild.id, 'userAvatarUpdate');
        if (!isEnabled) return;
        await auditLog.init(bot, member.guild.id, true);
        await auditLog.setEmbed({
            text: `**${member} has updated their avatar**\n**Old avatar**\n${oldAvatarURL}`,
            imageUrl: newAvatarURL,
        });
        await auditLog.sendToAuditLog({
            guildId: member.guild.id,
            target: member,
        });
    } catch (err) {}
};
