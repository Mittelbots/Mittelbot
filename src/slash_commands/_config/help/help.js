const { SlashCommandBuilder } = require('discord.js');

module.exports.helpConfig = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help for all commands');
