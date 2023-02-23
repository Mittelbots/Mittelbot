const { SlashCommandBuilder } = require('discord.js');
const {
    updateReactionRoles,
    removeReactionRoles,
} = require('../../../utils/functions/data/reactionroles');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    if (main_interaction.options.getSubcommand() === 'add') {
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
    } else if (main_interaction.options.getSubcommand() === 'remove') {
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
    } else {
    }
};

module.exports.data = new SlashCommandBuilder()
    .setName('reactionroles')
    .setDescription('Manage reaction roles')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a reaction role')
            .addStringOption((messagelink) =>
                messagelink
                    .setName('message_link')
                    .setDescription(
                        'Add the message Link [Right-Click/Hold on the message -> Copy Message Link]'
                    )
                    .setRequired(true)
            )
            .addStringOption((roles) =>
                roles
                    .setName('roles')
                    .setDescription(
                        'Add the roles you want to add to the message. [Role1 Role2 Role3]'
                    )
                    .setRequired(true)
            )

            .addStringOption((emoji) =>
                emoji
                    .setName('emojis')
                    .setDescription(
                        'Add the emoji you want to add to the message. [:emoji1: :emoji2: :emoji3:]'
                    )
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('remove')
            .setDescription('Remove a reaction role')
            .addStringOption((messagelink) =>
                messagelink
                    .setName('message_link')
                    .setDescription(
                        'Add the message Link [Right-Click/Hold on the message -> Copy Message Link]'
                    )
                    .setRequired(true)
            )
    );
