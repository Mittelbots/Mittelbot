const Auditlog = require('~utils/classes/Auditlog');

module.exports.guildMemberNicknameUpdate = async (bot, member, oldNickname, newNickname) => {
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(
        member.guild.id,
        'guildMemberNicknameUpdate'
    );
    if (!isEnabled) return;
    await auditLog.init(bot, member.guild.id, true);
    await auditLog.setEmbed({
        text: `**Nickname updated from ${member} **\n**Before**\n${oldNickname}\n**After**\n${newNickname}`,
    });
    await auditLog.sendToAuditLog({
        guildId: member.guild.id,
        target: member,
    });
};
