const { SlashCommandBuilder } = require('discord.js');

module.exports.hangmanConfig = new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Start a new game of hangman (Only one game per server)');
