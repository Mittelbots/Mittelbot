const { SlashCommandBuilder } = require('discord.js');

module.exports.reactionRolesConfig = new SlashCommandBuilder()
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
        subcommand.setName('view').setDescription('View all of your reaction roles')
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

module.exports.reactionrolesPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
