const { SlashCommandBuilder } = require('discord.js');

module.exports.bugConfig = new SlashCommandBuilder()
    .setName('bug')
    .setDescription('Report a bug to the bot developers')
    .addStringOption((option) =>
        option
            .setName('bug')
            .setDescription('Describe the bug you have found as detailed as possible')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('reproduce')
            .setDescription("Describe how to reproduce the bug. If you don't know how, just say so")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('expected')
            .setDescription('Describe what you expected to happen')
            .setRequired(true)
    );
