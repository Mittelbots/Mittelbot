const { SlashCommandBuilder } = require('discord.js');

module.exports.guessnumberConfig = new SlashCommandBuilder()
    .setName('guessnumber')
    .setDescription('Guess the number between two random numbers!');
