const Auditlog = require('~utils/classes/Auditlog');

module.exports.autoModerationRuleDelete = async (bot, rule) => {
    const auditLog = new Auditlog();
    await auditLog.init(bot, rule.guild.id);
    await auditLog.setEmbed({
        color: global.t.trans(['general.colors.error']),
        text: `**Auto Moderation Rule deleted** \n ${rule.name}`,
    });
    await auditLog.sendToAuditLog({
        guildId: rule.guild.id,
        target: rule.guild,
    });
};
