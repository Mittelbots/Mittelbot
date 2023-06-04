const { unmuteUser } = require('~utils/functions/moderations/unmuteUser');
const { unmuteConfig, unmutePerms } = require('../_config/moderation/unmute');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

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
module.exports.permissions = unmutePerms;
