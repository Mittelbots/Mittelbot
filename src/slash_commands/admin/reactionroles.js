const {
    updateReactionRoles,
    removeReactionRoles,
    viewAllReactionRoles,
} = require('~utils/functions/data/reactionroles');
const { reactionRolesConfig, reactionrolesPerms } = require('../_config/admin/reactionroles');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const subCommand = main_interaction.options.getSubcommand();

    if (subCommand === 'add') {
        const message_link = main_interaction.options.getString('message_link');
        const reactionroles = main_interaction.options.getString('roles');
        const emojis = main_interaction.options.getString('emojis');

        updateReactionRoles({
            guild_id: main_interaction.guild.id,
            message_link,
            roles: reactionroles,
            emojis,
            main_interaction,
        })
            .then((res) => {
                main_interaction
                    .followUp({
                        content: res,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            })
            .catch((err) => {
                main_interaction
                    .followUp({
                        content: err,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            });
    } else if (subCommand === 'remove') {
        const message_link = main_interaction.options.getString('message_link');
        removeReactionRoles({
            guild_id: main_interaction.guild.id,
            message_link,
            main_interaction,
        })
            .then((res) => {
                main_interaction
                    .followUp({
                        content: res,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            })
            .catch((err) => {
                main_interaction
                    .followUp({
                        content: err,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            });
    } else if (subCommand === 'view') {
        await viewAllReactionRoles(main_interaction.guild.id)
            .then((res) => {
                main_interaction
                    .followUp({
                        embeds: [res],
                        ephemeral: true,
                    })
                    .catch((err) => {});
            })
            .catch((err) => {
                main_interaction
                    .followUp({
                        content: err,
                        ephemeral: true,
                    })
                    .catch((err) => {});
            });
        return;
    } else {
    }
};

module.exports.data = reactionRolesConfig;
module.exports.permissions = reactionrolesPerms;
