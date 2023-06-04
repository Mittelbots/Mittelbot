const { SlashCommandBuilder } = require('discord.js');
const config = require('~assets/json/_config/config.json');
const { checkTarget } = require('~utils/functions/checkMessage/checkMessage');
const { warnUser } = require('~utils/functions/moderations/warnUser');

const { hasPermission } = require('~utils/functions/hasPermissions');
const { warnConfig, warnPerms } = require('../_config/moderation/warn');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const user = main_interaction.options.getUser('user');
    const reason = main_interaction.options.getString('reason');

    const canIWarnTheUser = await checkTarget({
        author: main_interaction.user,
        target: user,
        guild: main_interaction.guild,
        bot,
        type: 'warn',
    }).catch((err) => {
        main_interaction
            .followUp({
                content: err,
                ephemeral: true,
            })
            .catch((err) => {});
    });

    if (!canIWarnTheUser) return;

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
module.exports.permissions = warnPerms;
