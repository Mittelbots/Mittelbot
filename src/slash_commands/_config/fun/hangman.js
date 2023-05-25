const { SlashCommandBuilder } = require('discord.js');

module.exports.hangmanConfig = new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Start a new game of hangman (Only one game per server)')
    .addStringOption((option) =>
        option
            .setName('word')
            .setDescription('Pick the secret word the other players will need to guess')
            .setRequired(true)
    );
