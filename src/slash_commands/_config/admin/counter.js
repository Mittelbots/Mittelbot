const { SlashCommandBuilder } = require('discord.js');

module.exports.counterConfig = new SlashCommandBuilder()
    .setName('counter')
    .setDescription('Add new counter to the server.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add new counter to the server.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('The Channel where every user can count in.')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('remove').setDescription('Remove the counter from the server.')
    );

module.exports.counterPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
