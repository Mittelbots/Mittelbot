const Auditlog = require('~utils/classes/Auditlog');

module.exports.autoModerationRuleCreate = async (bot, rule) => {
    const keywordFilter = rule.triggerMetadata.keywordFilter.join(', ') || 'none';
    const regexPatterns = rule.triggerMetadata.regexPatterns.join(', ') || 'none';
    const presets = rule.triggerMetadata.presets.join(', ') || 'none';
    const allowList = rule.triggerMetadata.allowList.join(', ') || 'none';
    const mentionTotalLimit = rule.triggerMetadata.mentionTotalLimit || 'none';
    const exemptRoles =
        rule.triggerMetadata?.exemptRoles?.length > 0
            ? rule.triggerMetadata.exemptRoles.map((role) => {
                  return `<@&${role}>`;
              }) || 'none'
            : 'none';
    const exemptChannels =
        rule.triggerMetadata?.exemptChannels?.length > 0
            ? rule.triggerMetadata.exemptChannels.map((channel) => {
                  return `<#${channel}>`;
              }) || 'none'
            : 'none';
    const actions = rule.actions;

    const actionFields = actions.map((action) => {
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
    await auditLog.init(bot, rule.guild.id);
    await auditLog.setEmbed({
        color: global.t.trans(['general.colors.success']),
        text: `**Auto Moderation Rule created**`,
        fields: [
            {
                name: 'Rulename',
                value: rule.name,
                inline: true,
            },
            {
                name: 'Created by',
                value: `<@${rule.creatorId}>`,
                inline: true,
            },
            {
                name: 'Keywords',
                value: keywordFilter,
            },
            {
                name: 'Regex',
                value: regexPatterns,
            },
            {
                name: 'Presets',
                value: presets,
            },
            {
                name: 'Allowlist',
                value: allowList,
            },
            {
                name: 'Mention total limit',
                value: mentionTotalLimit,
            },
            {
                name: 'Exempt roles',
                value: exemptRoles,
            },
            {
                name: 'Exempt channels',
                value: exemptChannels,
            },
            ...actionFields,
        ],
    });

    await auditLog.sendToAuditLog({
        guildId: rule.guild.id,
        target: rule.guild,
    });
};
