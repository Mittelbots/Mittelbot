const { EmbedBuilder } = require('discord.js');
const { Automod } = require('../../../utils/functions/data/Automod');
const { antiInviteConfig, antiInvitePerms } = require('../_config/admin/antiinvite');
const { removeMention, removeHttp } = require('../../../utils/functions/removeCharacters');
const { isValidDiscordInvite } = require('../../../utils/functions/validate/isValidDiscordInvite');

module.exports.run = async ({ main_interaction, bot }) => {
    const antiInviteSettings = await Automod.get(main_interaction.guild.id, 'antiinvite');

    const antiInviteEnabled = JSON.parse(main_interaction.options.getString('enabled'));
    const antiInviteAction = main_interaction.options.getString('action');

    const whitelistrolesInput = main_interaction.options.getString('whitelistroles') || '';
    const whitelistchannelsInput = main_interaction.options.getString('whitelistchannels') || '';
    const whitelistInviteInput = main_interaction.options.getString('whitelistinvite') || '';

    const setting = {
        enabled: antiInviteEnabled,
        action: antiInviteAction,
        whitelistroles: antiInviteSettings.whitelistroles || [],
        whitelistchannels: antiInviteSettings.whitelistchannels || [],
        whitelistinvites: antiInviteSettings.whitelistinvites || [],
    };

    whitelistrolesInput.split(',').forEach((role) => {
        const roleId = removeMention(role);
        if (setting.whitelistroles.includes(roleId)) {
            setting.whitelistroles.splice(setting.whitelistroles.indexOf(roleId), 1);
        } else {
            if (parseInt(roleId)) {
                setting.whitelistroles.push(roleId);
            }
        }
    });

    whitelistchannelsInput.split(',').forEach((channel) => {
        const channelId = removeMention(channel);
        if (setting.whitelistchannels.includes(channelId)) {
            setting.whitelistchannels.splice(setting.whitelistchannels.indexOf(channelId), 1);
        } else {
            if (parseInt(channelId)) {
                setting.whitelistchannels.push(channelId);
            }
        }
    });

    whitelistInviteInput.split(',').forEach((link) => {
        if (!isValidDiscordInvite(link)) return;

        if (setting.whitelistinvites.includes(link)) {
            setting.whitelistinvites.splice(setting.whitelistinvites.indexOf(link), 1);
        } else {
            setting.whitelistinvites.push(link);
            setting.whitelistinvites = setting.whitelistinvites.filter((link) => link !== '');
        }
    });

    Automod.update({
        guild_id: main_interaction.guild.id,
        value: setting,
        type: 'antiinvite',
    })
        .then(() => {
            const description = setting.enabled
                ? global.t.trans(
                      [
                          'success.automod.antiinvite.enabled',
                          antiInviteAction,
                          setting.whitelistroles.map((role) => `<@&${role}>`).join(' ') || 'Empty',
                          setting.whitelistchannels.map((channel) => `<#${channel}>`).join(' ') ||
                              'Empty',
                          setting.whitelistinvites.join(', ') || 'Empty',
                      ],
                      main_interaction.guild.id
                  )
                : global.t.trans(
                      ['success.automod.antiinvite.disabled'],
                      main_interaction.guild.id
                  );

            main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(description)
                            .setColor(global.t.trans(['general.colors.success'])),
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

module.exports.data = antiInviteConfig;
module.exports.permissions = antiInvitePerms;
