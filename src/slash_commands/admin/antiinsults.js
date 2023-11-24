const { EmbedBuilder } = require('discord.js');
const Automod = require('~utils/classes/Automod');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { antiInsultsConfig, antiInsultsPerms } = require('../_config/admin/antiinsults');
const { escape, unescape } = require('validator');
const { removeMention } = require('~utils/functions/removeCharacters');

module.exports.run = async ({ main_interaction, bot }) => {
    const anitInsultssetting = await new Automod().get(main_interaction.guild.id, 'antiinsults');
    await main_interaction.deferReply({ ephemeral: true });
    const antiInsultsEnabled = JSON.parse(main_interaction.options.getString('enabled'));
    const antiInsultsAction = main_interaction.options.getString('action');
    const words = main_interaction.options.getString('words');
    const removeWords = main_interaction.options.getString('remove');

    const whitelistrolesInput = main_interaction.options.getString('whitelistroles') || '';
    const whitelistchannelsInput = main_interaction.options.getString('whitelistchannels') || '';

    const setting = {
        enabled: antiInsultsEnabled,
        action: antiInsultsAction,
        words: anitInsultssetting.words || [],
        whitelistroles: anitInsultssetting.whitelistroles || [],
        whitelistchannels: anitInsultssetting.whitelistchannels || [],
    };

    whitelistrolesInput.split(',').forEach((role) => {
        const roleId = removeMention(role);
        if (setting.whitelistroles.includes(roleId)) {
            setting.whitelistroles.splice(setting.whitelistroles.indexOf(roleId), 1);
        } else {
            if (parseInt(roleId, 10)) {
                setting.whitelistroles.push(roleId);
            }
        }
    });

    whitelistchannelsInput.split(',').forEach((channel) => {
        const channelId = removeMention(channel);
        if (setting.whitelistchannels.includes(channelId)) {
            setting.whitelistchannels.splice(setting.whitelistchannels.indexOf(channelId), 1);
        } else {
            if (!parseInt(channelId, 10)) return;

            setting.whitelistchannels.push(channelId);
        }
    });

    if (removeWords) {
        setting.words = setting.words.filter((word) => unescape(word, ' ') !== words);
    } else {
        words.split(',').forEach((word) => {
            if (setting.words.includes(escape(word, ' '))) return;
            setting.words.push(escape(word, ' '));
        });
    }

    new Automod()
        .update({
            guild_id: main_interaction.guild.id,
            value: setting,
            type: 'antiinsults',
        })
        .then(() => {
            errorhandler({
                fatal: false,
                message: `${main_interaction.guild.id} has been updated the anti Insults config.`,
                id: 1694432692,
            });

            const replyData = [
                setting.action,
                setting.whitelistroles.map((role) => `<@&${role}>`).join(' ') || 'Empty',
                setting.whitelistchannels.map((channel) => `<#${channel}>`).join(' ') || 'Empty',
                setting.words.map((word) => unescape(word)).join(', ') || 'Empty',
            ];

            const description = removeWords
                ? global.t.trans(
                      ['success.admin.automod.antiinsults.removed', words],
                      main_interaction.guild.id
                  )
                : setting.enabled
                  ? global.t.trans(
                        ['success.admin.automod.antiinsults.enabled', ...replyData],
                        main_interaction.guild.id
                    )
                  : global.t.trans(
                        ['success.admin.automod.antiinsults.disabled', ...replyData],
                        main_interaction.guild.id
                    );

            main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(description)
                            .setColor(
                                global.t.trans([
                                    'general.colors.' + (removeWords ? 'success' : 'error'),
                                ])
                            ),
                    ],
                    ephemeral: true,
                })
                .catch(() => {});
        })
        .catch((err) => {
            main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.generalWithMessage', err.message],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch(() => {});
        });
};

module.exports.data = antiInsultsConfig;
module.exports.permissions = antiInsultsPerms;
