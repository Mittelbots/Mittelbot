const { SlashCommandBuilder } = require('discord.js');

module.exports.kickmeConfig = new SlashCommandBuilder()
    .setName('kickme')
    .setDescription('WARNING! You will kick yourself!');
