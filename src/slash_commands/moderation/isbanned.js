const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('~utils/functions/hasPermissions');
const config = require('~assets/json/_config/config.json');
const { isOnBanList } = require('~utils/functions/moderations/checkOpenInfractions');
const { isbannedConfig, isbannedPerms } = require('../_config/moderation/isbanned');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const user = main_interaction.options.getUser('user');
    let isOnBanListCB = await isOnBanList({
        user,
        guild: main_interaction.guild,
    });

    return main_interaction
        .followUp({
            content: isOnBanListCB[0]
                ? global.t.trans(
                      [
                          'success.moderation.isBanned.userIsBanned',
                          isOnBanListCB[1],
                          isOnBanListCB[2],
                      ],
                      main_interaction.guild.id
                  )
                : global.t.trans(
                      ['success.moderation.isBanned.userIsNotBanned'],
                      main_interaction.guild.id
                  ),
            ephemeral: true,
        })
        .catch((err) => {});
};

module.exports.data = isbannedConfig;
module.exports.permissions = isbannedPerms;
