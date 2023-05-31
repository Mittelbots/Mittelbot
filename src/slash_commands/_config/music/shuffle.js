const { SlashCommandBuilder } = require('discord.js');

module.exports.shuffleConfig = new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the playlist');
