const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const { checkTarget } = require('../../../utils/functions/checkMessage/checkMessage');
const { warnUser } = require('../../../utils/functions/moderations/warnUser');

const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { warnConfig } = require('../_config/moderation/warn');

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
    const reason = main_interaction.options.getString('reason');

    const canIWarnTheUser = await checkTarget({
        author: main_interaction.user,
        target: user,
        guild: main_interaction.guild,
        bot,
        type: 'warn',
    });

    if (!canIWarnTheUser)
        return main_interaction
            .followUp({
                content: canIWarnTheUser,
                ephemeral: true,
            })
            .catch((err) => {});

    const warned = await warnUser({
        bot,
        user,
        mod: main_interaction.user,
        guild: main_interaction.guild,
        reason,
    });

    if (warned.error)
        return main_interaction
            .followUp({
                content: warned.message,
                ephemeral: true,
            })
            .catch((err) => {});

    return main_interaction
        .followUp({
            embeds: [warned.message],
            ephemeral: true,
        })
        .catch((err) => {});
};

module.exports.data = warnConfig;
