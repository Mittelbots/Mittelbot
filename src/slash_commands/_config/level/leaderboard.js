const { SlashCommandBuilder } = require('discord.js');

module.exports.leaderboardConfig = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('See the guild Leaderboard.');
