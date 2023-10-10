const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports.welcomeSettingsConfig = new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Set the welcome message and channel.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Remove the welcome message and channel.')
            .addChannelOption((channel) =>
                channel
                    .setName('channel')
                    .setDescription('The channel you want to set as welcome channel.')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('status')
            .setDescription('Activate or deactivate the welcome message.')
            .addBooleanOption((option) =>
                option
                    .setName('status')
                    .setDescription('The status you want to set.')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('remove').setDescription('Remove the welcome message and channel.')
    );

module.exports.welcomeSettingsPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [PermissionFlagsBits.Administrator],
    botOwnerOnly: false,
};
