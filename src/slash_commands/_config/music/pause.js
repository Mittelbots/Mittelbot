const { SlashCommandBuilder } = require('discord.js');

module.exports.pauseConfig = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song.');
