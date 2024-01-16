const { hasPermission } = require('~utils/functions/hasPermissions');
const Levelsystem = require('~utils/classes/levelsystemAPI');
const { removexpConfig } = require('../_config/level/removexp');
const { EmbedBuilder } = require('discord.js');

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
            .reply({
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
            .catch(() => {});
    }

    const user = main_interaction.options.getUser('user');
    const amount = main_interaction.options.getNumber('xp');

    if (user.bot || user.system) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.level.removexp.cannotRemoveFromBots'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.success'])),
                ],
                ephemeral: true,
            })
            .catch(() => {});
    }

    const currentXP = await new Levelsystem().gain({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
    });

    if (!currentXP) {
        return main_interaction
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['error.general'], main_interaction.guild.id)
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch(() => {});
    }

    let newAmount = Number(currentXP) - Number(amount);

    if (newAmount < 0) newAmount = 0;

    const updated = await new Levelsystem().update({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
        value: newAmount,
        valueName: 'xp',
    });

    if (updated) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['success.moderation.removexp.xpRemoved', amount, user],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.success'])),
                ],
            })
            .catch((err) => {});
    } else {
        return main_interaction
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['error.general'], main_interaction.guild.id)
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }
};

module.exports.data = removexpConfig;
