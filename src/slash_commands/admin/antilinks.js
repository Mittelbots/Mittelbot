const { EmbedBuilder } = require('discord.js');
const Automod = require('~utils/classes/Automod');
const { antiLinksConfig, antiLinksPerms } = require('../_config/admin/antilinks');
const { removeMention, removeHttp } = require('~utils/functions/removeCharacters');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { isURL } = require('validator');

module.exports.run = async ({ main_interaction }) => {
    const guildId = main_interaction.guild.id;
    const antilinksEnabled = JSON.parse(main_interaction.options.getString('enabled'));
    const antilinksAction = main_interaction.options.getString('action');
    const whitelistrolesInput = main_interaction.options.getString('whitelistroles') || '';
    const whitelistchannelsInput = main_interaction.options.getString('whitelistchannels') || '';
    const whitelistlinksInput = main_interaction.options.getString('whitelistlinks') || '';

    const antilinksSetting = await new Automod().get(main_interaction.guild.id, 'antilinks');

    const setting = {
        enabled: antilinksEnabled,
        action: antilinksAction,
        whitelistroles: antilinksSetting.whitelistroles || [],
        whitelistchannels: antilinksSetting.whitelistchannels || [],
        whitelistlinks: antilinksSetting.whitelistlinks || [],
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
            if (parseInt(channelId, 10)) {
                setting.whitelistchannels.push(channelId);
            }
        }
    });

    whitelistlinksInput.split(',').forEach((link) => {
        if (
            !isURL(link, {
                require_host: true,
            })
        )
            return;
        const hostname = removeHttp(link);
        if (setting.whitelistlinks.includes(hostname)) {
            setting.whitelistlinks.splice(setting.whitelistlinks.indexOf(hostname), 1);
        } else {
            setting.whitelistlinks.push(hostname);
            setting.whitelistlinks = setting.whitelistlinks.filter((link) => link !== '');
        }
    });

    new Automod()
        .update({
            guild_id: guildId,
            value: setting,
            type: 'antilinks',
        })
        .then(() => {
            errorhandler({
                fatal: false,
                message: `${main_interaction.guild.id} has been updated the anti Links config.`,
                id: 1694432710,
            });
            const description = antilinksEnabled
                ? global.t.trans(
                      [
                          'success.admin.automod.antilinks.enabled',
                          antilinksAction,
                          setting.whitelistroles.map((role) => `<@&${role}>`).join(' ') || 'Empty',
                          setting.whitelistchannels.map((channel) => `<#${channel}>`).join(' ') ||
                              'Empty',
                          setting.whitelistlinks.join(', ') || 'Empty',
                      ],
                      guildId
                  )
                : global.t.trans(['success.admin.automod.antilinks.disabled'], guildId);

            main_interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(description)
                        .setColor(global.t.trans(['general.colors.success'])),
                ],
                ephemeral: true,
            });
        })
        .catch((err) => {
            main_interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['error.generalWithMessage', err.message], guildId)
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            });
        });
};

module.exports.data = antiLinksConfig;
module.exports.permissions = antiLinksPerms;
