const { SlashCommandBuilder } = require('discord.js');

module.exports.repeatConfig = new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Repeat the playlist')
    .addBooleanOption((option) =>
        option.setName('enable').setDescription('Enable/Disable repeat').setRequired(true)
    );
