const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { unmuteUser } = require('../../../utils/functions/moderations/unmuteUser');
const { unmuteConfig } = require('../_config/moderation/unmute');

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
                content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const user = main_interaction.options.getUser('user');
    const reason = main_interaction.options.getString('reason');

    const unmuted = await unmuteUser({
        user,
        bot,
        mod: main_interaction.user,
        reason,
        guild: main_interaction.guild,
    });

    if (unmuted.error) {
        return main_interaction
            .followUp({
                content: unmuted.message,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    return main_interaction
        .followUp({
            embeds: [unmuted.message],
            ephemeral: true,
        })
        .catch((err) => {});
};

module.exports.data = unmuteConfig;
