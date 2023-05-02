const Auditlog = require('../utils/functions/data/Auditlog');

module.exports.autoModerationRuleUpdate = async (bot, oldRule, newRule) => {
    const newRuleOptions = {
        keywordFilter: newRule.triggerMetadata.keywordFilter.join(', ') || 'none',
        regexPatterns: newRule.triggerMetadata.regexPatterns.join(', ') || 'none',
        presets: newRule.triggerMetadata.presets.join(', ') || 'none',
        allowList: newRule.triggerMetadata.allowList.join(', ') || 'none',
        mentionTotalLimit: newRule.triggerMetadata.mentionTotalLimit || 'none',
        actions: newRule.actions,
    };

    let oldRuleOptions;
    if (oldRule) {
        oldRuleOptions = {
            keywordFilter: oldRule.triggerMetadata.keywordFilter.join(', ') || 'none',
            regexPatterns: oldRule.triggerMetadata.regexPatterns.join(', ') || 'none',
            presets: oldRule.triggerMetadata.presets.join(', ') || 'none',
            allowList: oldRule.triggerMetadata.allowList.join(', ') || 'none',
            mentionTotalLimit: oldRule.triggerMetadata.mentionTotalLimit || 'none',
            actions: oldRule.actions,
        };
    }

    newRuleOptions.actions.map((action) => {
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
    await auditLog.setEmbed({
        color: global.t.trans(['general.colors.info']),
        text: `**Auto Moderation Rule updated**`,
        fields: [
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
        ],
    });
    await auditLog.sendToAuditLog({
        guildId: newRule.guild.id,
        target: newRule.guild,
    });

    if (!oldRule) return;

    oldRuleOptions.actions.map((action) => {
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

    await auditLog.setEmbed({
        color: global.t.trans(['general.colors.error']),
        text: `**Auto Moderation Rule updated**`,
        fields: [
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
                name: 'Old Keyword Filter',
                value: newRuleOptions.keywordFilter,
            },
            {
                name: 'Old Regex Patterns',
                value: newRuleOptions.regexPatterns,
            },
            {
                name: 'Old Presets',
                value: newRuleOptions.presets,
            },
            {
                name: 'Old Allow List',
                value: newRuleOptions.allowList,
            },
            {
                name: 'Old Mention Total Limit',
                value: newRuleOptions.mentionTotalLimit,
            },
            ...oldActionFields,
        ],
    });

    await auditLog.sendToAuditLog({
        guildId: oldRule.guild.id,
        target: oldRule.guild,
    });
};
