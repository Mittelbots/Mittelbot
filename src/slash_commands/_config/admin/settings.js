const { SlashCommandBuilder } = require('discord.js');

module.exports.settingsConfig = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('All important settings which you can set, edit or remove.')
    .addSubcommand((command) => command.setName('view').setDescription('View all of your settings'))
    .addSubcommand((command) =>
        command
            .setName('welcomemessage')
            .setDescription('Set the welcome message and channel.')
            .addChannelOption((channel) =>
                channel
                    .setName('channel')
                    .setDescription('The channel you want to set as welcome channel.')
                    .setRequired(true)
            )
    )
    .addSubcommand((command) =>
        command
            .setName('cooldown')
            .setDescription('Set the cooldown for your Guild.')
            .addNumberOption((cooldown) =>
                cooldown
                    .setName('cooldown')
                    .setDescription('The cooldown you want to set. (in seconds)')
                    .setRequired(true)
            )
    );
