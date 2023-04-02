const { SlashCommandBuilder } = require('discord.js');

module.exports.stopConfig = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current song and clear the queue.');
