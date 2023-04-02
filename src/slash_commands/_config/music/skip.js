const { SlashCommandBuilder } = require('discord.js');

module.exports.skipConfig = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song.');
