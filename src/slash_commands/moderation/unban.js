const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isBanned } = require('../../../utils/functions/moderations/checkOpenInfractions');
const { unbanUser } = require('../../../utils/functions/moderations/unbanUser');
const { unbanConfig } = require('../_config/moderation/unban');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: true,
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
    const reason = main_interaction.options.getString('reason');

    const isUserBanned = await isBanned(user, main_interaction.guild);

    if (!isUserBanned) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['error.unban.notBanned'], main_interaction.guild.id)
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    await unbanUser({
        user,
        bot,
        mod: main_interaction.user,
        reason,
        guild: main_interaction.guild,
    })
        .then((res) => {
            return main_interaction
                .followUp({
                    embeds: [res.message],
                    ephemeral: true,
                })
                .catch((err) => {});
        })
        .catch((err) => {
            return main_interaction
                .followUp({
                    content: err,
                    ephemeral: true,
                })
                .catch((err) => {});
        });

    return;
};

module.exports.data = unbanConfig;
