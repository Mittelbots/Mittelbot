const { SlashCommandBuilder } = require('discord.js');

module.exports.resumeData = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the last song.');
