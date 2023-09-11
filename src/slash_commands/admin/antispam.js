const { EmbedBuilder } = require('discord.js');
const Automod = require('~utils/classes/Automod');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { antiSpamConfig, antiSpamPerms } = require('../_config/admin/antispam');
const { removeMention } = require('~utils/functions/removeCharacters');
const AutomodAntiSpam = require('~utils/classes/Automoderation/Automod-AntiSpam');

module.exports.run = async ({ main_interaction, bot }) => {
    const antiSpamSettings = await new Automod().get(main_interaction.guild.id, 'antispam');

    const antiSpamEnabled = JSON.parse(main_interaction.options.getString('enabled'));
    const antiSpamAction = main_interaction.options.getString('action');

    const detectduplicate =
        JSON.parse(main_interaction.options.getBoolean('detectduplicate')) || false;
    let pingLimit = main_interaction.options.getNumber('pinglimit') || 0;
    if (pingLimit < new AutomodAntiSpam().pingLimitMin) pingLimit = 0;

    const whitelistrolesInput = main_interaction.options.getString('whitelistroles') || '';
    const whitelistchannelsInput = main_interaction.options.getString('whitelistchannels') || '';

    const setting = {
        enabled: antiSpamEnabled,
        action: antiSpamAction,
        whitelistroles: antiSpamSettings.whitelistroles || [],
        whitelistchannels: antiSpamSettings.whitelistchannels || [],
        detectduplicate: detectduplicate,
        pinglimit: pingLimit,
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

    new Automod()
        .update({
            guild_id: main_interaction.guild.id,
            value: setting,
            type: 'antispam',
        })
        .then(() => {
            errorhandler({
                fatal: false,
                message: `${main_interaction.guild.id} has been updated the antispam config.`,
                id: 1694432722,
            });

            const description = setting.enabled
                ? global.t.trans(
                      [
                          'success.admin.automod.antispam.enabled',
                          setting.action,
                          setting.whitelistroles.map((role) => `<@&${role}>`).join(' ') || 'Empty',
                          setting.whitelistchannels.map((channel) => `<#${channel}>`).join(' ') ||
                              'Empty',
                          setting.detectduplicate ? 'Enabled' : 'Disabled',
                          setting.pinglimit < new AutomodAntiSpam().pingLimitMin
                              ? 'Disabled'
                              : setting.pinglimit,
                      ],
                      main_interaction.guild.id
                  )
                : global.t.trans(
                      ['success.admin.automod.antispam.disabled'],
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

module.exports.data = antiSpamConfig;
module.exports.permissions = antiSpamPerms;
