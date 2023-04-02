const { SlashCommandBuilder } = require('discord.js');

module.exports.timerConfig = new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Setup a timer')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('start')
            .setDescription('Start a timer')

            .addStringOption((option) =>
                option
                    .setName('date')
                    .setDescription('When should the timer end? (DD.MM.YYYY)')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('time')
                    .setDescription('When should the timer end? (HH:MM)')
                    .setRequired(true)
            )

            .addStringOption((option) =>
                option
                    .setName('end_message')
                    .setDescription('What should the bot send when the timer is over?')
                    .setRequired(true)
            )
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('In which channel should the timer be posted?')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('stop').setDescription('Stop the current timer in this server')
    );
