const Auditlog = require('~utils/classes/Auditlog');

module.exports.autoModerationRuleUpdate = async (bot, oldRule, newRule) => {
    const newRuleOptions = {
        keywordFilter: newRule.triggerMetadata.keywordFilter.join(', ') || 'none',
        regexPatterns: newRule.triggerMetadata.regexPatterns.join(', ') || 'none',
        presets: newRule.triggerMetadata.presets.join(', ') || 'none',
        allowList: newRule.triggerMetadata.allowList.join(', ') || 'none',
        mentionTotalLimit: newRule.triggerMetadata.mentionTotalLimit || 'none',
        actions: newRule.actions,
    };

    const newActionFields = newRuleOptions.actions.map((action) => {
        return {
            name:
                action.type === 1
                    ? 'Delete Message'
                    : action.type === 2
                      ? 'Send alert to'
                      : action.type === 3
                        ? 'Timeout user'
                        : 'none',
            value:
                action.type === 1
                    ? 'True'
                    : action.type === 2
                      ? `<#${action.metadata.channelId}>`
                      : action.type === 3
                        ? `${action.metadata.durationSeconds} seconds`
                        : 'none',
        };
    });

    const auditLog = new Auditlog();
    await auditLog.init(bot, newRule.guild.id);

    const embedFields = [
        {
            name: 'Rulename',
            value: newRule.name,
            inline: true,
        },
        {
            name: 'Created by',
            value: `<@${newRule.creatorId}>`,
            inline: true,
        },
        {
            name: 'New Keyword Filter',
            value: newRuleOptions.keywordFilter,
        },
        {
            name: 'New Regex Patterns',
            value: newRuleOptions.regexPatterns,
        },
        {
            name: 'New Presets',
            value: newRuleOptions.presets,
        },
        {
            name: 'New Allow List',
            value: newRuleOptions.allowList,
        },
        {
            name: 'New Mention Total Limit',
            value: newRuleOptions.mentionTotalLimit,
        },
        ...newActionFields,
    ];

    await auditLog.setEmbed({
        color: global.t.trans(['general.colors.info']),
        text: `**Auto Moderation Rule updated**`,
        fields: embedFields,
    });
    await auditLog.sendToAuditLog({
        guildId: newRule.guild.id,
        target: newRule.guild,
    });
};
