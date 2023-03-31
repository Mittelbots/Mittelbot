const { SlashCommandBuilder } = require('discord.js');

module.exports.tutorialConfig = new SlashCommandBuilder()
    .setName('tutorial')
    .setDescription('Gives you important information about the Bot and how it works');
