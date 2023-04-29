const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');
const { isOnBanList } = require('../../../utils/functions/moderations/checkOpenInfractions');
const { isbannedConfig } = require('../_config/moderation/isbanned');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: false,
        user: main_interaction.member,
        bot,
    });

    if (!hasPermissions) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.permissions.user.useCommand'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const user = main_interaction.options.getUser('user');
    let isOnBanListCB = await isOnBanList({
        user,
        guild: main_interaction.guild,
    });

    return main_interaction
        .followUp({
            content: isOnBanListCB[0]
                ? global.t.trans(
                      ['success.isBanned.userIsBanned', isOnBanListCB[1], isOnBanListCB[2]],
                      main_interaction.guild.id
                  )
                : global.t.trans(['success.isBanned.userIsNotBanned'], main_interaction.guild.id),
            ephemeral: true,
        })
        .catch((err) => {});
};

module.exports.data = isbannedConfig;
