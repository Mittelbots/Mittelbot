const { SlashCommandBuilder } = require('discord.js');

module.exports.volumeConfig = new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust the volume');
