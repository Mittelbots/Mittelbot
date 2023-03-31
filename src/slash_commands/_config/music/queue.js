const { SlashCommandBuilder } = require('discord.js');

module.exports.queueConfig = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('See the current queue.');
