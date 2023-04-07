const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { Levelsystem } = require('../../../utils/functions/data/levelsystemAPI');
const config = require('../../assets/json/_config/config.json');
const { givexpConfig } = require('../_config/level/givexp');

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
            .catch((err) => {});
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
                                ['error.givexp.cannotGiveToBots'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const currentXP = await Levelsystem.gain({
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
            .catch((err) => {});
    }

    const updated = await Levelsystem.update({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
        value: Number(currentXP) + Number(amount),
        valueName: 'xp',
    });

    if (updated) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder().setDescription(
                        global.t.trans(
                            ['success.givexp.xpGiven', amount, user],
                            main_interaction.guild.id
                        )
                    ),
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

module.exports.data = givexpConfig;
