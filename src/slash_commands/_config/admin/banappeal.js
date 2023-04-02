const { SlashCommandBuilder } = require('discord.js');

module.exports.banAppealConfig = new SlashCommandBuilder()
    .setName('banappeal')
    .setDescription(
        'Setup a ban appeal for your server which gets send to the user when they get banned.'
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Setup a ban appeal for your server. {user} and {guild} are supported.')
            .addStringOption((option) =>
                option
                    .setName('title')
                    .setDescription('This will be displayed above the description.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('description')
                    .setDescription('This will be displayed above the questions.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('questions')
                    .setDescription(
                        'Separate them with a comma. It will be displayed in the order you enter them.'
                    )
                    .setRequired(true)
            )
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('The channel where the ban appeal will be sent to.')
                    .setRequired(true)
            )
            .addNumberOption((option) =>
                option
                    .setName('cooldown')
                    .setDescription(
                        'The cooldown in days for the ban appeal. Default is 0 (no cooldown).'
                    )
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('remove').setDescription('Remove the ban appeal from your server.')
    );
